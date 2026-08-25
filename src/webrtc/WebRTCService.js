export default class WebRTCService {
  constructor({
    localMemberId,
    sendSignal,
    onRemoteStream,
    onRemoteStreamRemoved,
    onConnectionStateChange,
  }) {
    this.localMemberId = localMemberId;
    this.sendSignal = sendSignal;

    this.onRemoteStream = onRemoteStream;
    this.onRemoteStreamRemoved = onRemoteStreamRemoved;
    this.onConnectionStateChange = onConnectionStateChange;

    this.peers = new Map();
    this.pendingIceCandidates = new Map();

    this.offerInProgress = new Set();
    this.offerCreated = new Set();

    this.localStream = null;
  }

  async setLocalStream(stream) {
    this.localStream = stream;

    await Promise.all(
      Array.from(this.peers.values()).map((peer) => this.addLocalTracks(peer)),
    );
  }

  getPeer(memberId) {
    return this.peers.get(Number(memberId));
  }

  async createPeer(memberId) {
    memberId = Number(memberId);

    let peer = this.peers.get(memberId);

    if (peer) {
      return peer;
    }

    const connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peer = {
      memberId,
      connection,
      remoteStream: new MediaStream(),

      transceivers: {
        audio: null,
        video: null,
      },
    };

    this.peers.set(memberId, peer);

    console.log("[WebRTC] PEER CREATED", {
      localMemberId: this.localMemberId,
      remoteMemberId: memberId,
    });

    connection.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      const sent = this.sendSignal({
        type: "webrtc_ice_candidate",
        target_member_id: memberId,
        candidate: event.candidate,
      });

      if (!sent) {
        console.warn(`Failed to send ICE candidate to ${memberId}`);
      }
    };

    connection.ontrack = (event) => {
      const remoteStream = peer.remoteStream;

      const exists = remoteStream
        .getTracks()
        .some((track) => track.id === event.track.id);

      if (!exists) {
        remoteStream.addTrack(event.track);
      }

      console.log("[WebRTC] REMOTE TRACK", {
        memberId,
        kind: event.track.kind,
        id: event.track.id,
        muted: event.track.muted,
        readyState: event.track.readyState,
      });

      this.onRemoteStream?.({
        memberId,
        stream: remoteStream,
      });

      event.track.onunmute = () => {
        console.log("[WebRTC] REMOTE TRACK UNMUTED", {
          memberId,
          kind: event.track.kind,
        });

        this.onRemoteStream?.({
          memberId,
          stream: remoteStream,
        });
      };

      event.track.onended = () => {
        remoteStream.removeTrack(event.track);

        this.onRemoteStream?.({
          memberId,
          stream: remoteStream,
        });
      };
    };

    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;

      console.log("[WebRTC] CONNECTION STATE", {
        localMemberId: this.localMemberId,
        remoteMemberId: memberId,
        state,
        iceConnectionState: connection.iceConnectionState,
        signalingState: connection.signalingState,
      });

      this.onConnectionStateChange?.({
        memberId,
        state,
      });

      if (state === "failed" || state === "closed") {
        this.removePeer(memberId);
      }
    };

    return peer;
  }

  ensureMediaTransceivers(peer) {
    const { connection } = peer;

    for (const transceiver of connection.getTransceivers()) {
      const kind =
        transceiver.receiver?.track?.kind || transceiver.sender?.track?.kind;

      if (kind === "audio" || kind === "video") {
        peer.transceivers[kind] = transceiver;
      }
    }

    for (const kind of ["audio", "video"]) {
      if (peer.transceivers[kind]) {
        continue;
      }

      peer.transceivers[kind] = connection.addTransceiver(kind, {
        direction: "sendrecv",
      });
    }
  }

  queueIceCandidate(memberId, candidate) {
    memberId = Number(memberId);

    if (!this.pendingIceCandidates.has(memberId)) {
      this.pendingIceCandidates.set(memberId, []);
    }

    this.pendingIceCandidates.get(memberId).push(candidate);
  }

  async flushIceCandidates(memberId) {
    memberId = Number(memberId);

    const candidates = this.pendingIceCandidates.get(memberId);

    if (!candidates?.length) {
      return;
    }

    const peer = this.getPeer(memberId);

    if (!peer?.connection.remoteDescription) {
      return;
    }

    for (const candidate of candidates) {
      try {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error(`[WebRTC] Failed queued ICE from ${memberId}:`, error);
      }
    }

    this.pendingIceCandidates.delete(memberId);
  }

  async addLocalTracks(peer) {
    this.ensureMediaTransceivers(peer);

    for (const kind of ["audio", "video"]) {
      const transceiver = peer.transceivers[kind];

      const track =
        this.localStream
          ?.getTracks()
          .find((item) => item.kind === kind && item.readyState === "live") ??
        null;

      /*
       * Ensure both sides can send and receive this media type.
       */
      transceiver.direction = "sendrecv";

      if (typeof transceiver.sender.setStreams === "function") {
        if (this.localStream) {
          transceiver.sender.setStreams(this.localStream);
        } else {
          transceiver.sender.setStreams();
        }
      }

      if (transceiver.sender.track !== track) {
        await transceiver.sender.replaceTrack(track);
      }
    }
  }

  async createOffer(memberId) {
    memberId = Number(memberId);

    if (this.offerCreated.has(memberId) || this.offerInProgress.has(memberId)) {
      return;
    }

    this.offerInProgress.add(memberId);

    try {
      const peer = await this.createPeer(memberId);

      const { connection } = peer;

      await this.addLocalTracks(peer);

      if (connection.signalingState !== "stable") {
        return;
      }

      const offer = await connection.createOffer();

      await connection.setLocalDescription(offer);

      const sent = this.sendSignal({
        type: "webrtc_offer",
        target_member_id: memberId,
        sdp: connection.localDescription.sdp,
      });

      if (!sent) {
        throw new Error("Failed to send WebRTC offer.");
      }

      this.offerCreated.add(memberId);

      console.log("[WebRTC] Offer sent:", {
        memberId,
      });
    } catch (error) {
      console.error(`[WebRTC] Failed to create offer for ${memberId}:`, error);
    } finally {
      this.offerInProgress.delete(memberId);
    }
  }

  async handleOffer({ from_member_id, sdp }) {
    const memberId = Number(from_member_id);

    console.log("[WebRTC] Handling offer from", memberId);

    const peer = await this.createPeer(memberId);

    const { connection } = peer;

    try {
      /*
       * Apply the offer first. This creates transceivers
       * corresponding to the offer's audio/video sections.
       */
      await connection.setRemoteDescription(
        new RTCSessionDescription({
          type: "offer",
          sdp,
        }),
      );

      /*
       * Find the transceivers created by the offer and attach
       * this user's local tracks before creating the answer.
       */
      await this.addLocalTracks(peer);

      await this.flushIceCandidates(memberId);

      const answer = await connection.createAnswer();

      await connection.setLocalDescription(answer);

      console.log(
        "[WebRTC] Answer transceivers",
        connection.getTransceivers().map((transceiver) => ({
          kind: transceiver.receiver?.track?.kind,
          direction: transceiver.direction,
          currentDirection: transceiver.currentDirection,
          sendingTrack: transceiver.sender?.track?.kind ?? null,
          sendingTrackEnabled: transceiver.sender?.track?.enabled ?? null,
        })),
      );

      const sent = this.sendSignal({
        type: "webrtc_answer",
        target_member_id: memberId,
        sdp: connection.localDescription.sdp,
      });

      if (!sent) {
        throw new Error("Failed to send WebRTC answer.");
      }
    } catch (error) {
      console.error(`[WebRTC] Failed handling offer from ${memberId}:`, error);
    }
  }

  async handleAnswer({ from_member_id, sdp }) {
    const memberId = Number(from_member_id);

    const peer = this.getPeer(memberId);

    if (!peer) {
      console.warn(`Received answer for unknown peer ${memberId}`);

      return;
    }

    try {
      await peer.connection.setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp,
        }),
      );

      await this.flushIceCandidates(memberId);

      console.log(
        "[WebRTC] Applied answer",
        peer.connection.getTransceivers().map((transceiver) => ({
          kind: transceiver.receiver?.track?.kind,
          direction: transceiver.direction,
          currentDirection: transceiver.currentDirection,
          receivingTrack: transceiver.receiver?.track?.readyState,
        })),
      );
    } catch (error) {
      console.error(`[WebRTC] Failed handling answer from ${memberId}:`, error);
    }
  }

  async handleIceCandidate({ from_member_id, candidate }) {
    const memberId = Number(from_member_id);

    console.log(`[WebRTC] Handling ICE from ${memberId}`);

    if (!candidate) {
      return;
    }

    const peer = await this.createPeer(memberId);

    if (!peer.connection.remoteDescription) {
      console.log(`[WebRTC] Queueing ICE from ${memberId}`);

      this.queueIceCandidate(memberId, candidate);

      return;
    }

    try {
      await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error(`[WebRTC] Failed ICE from ${memberId}:`, error);
    }
  }

  async connectToParticipants(participants, readyMemberIds) {
    if (!this.localStream) {
      console.log("[WebRTC] Cannot negotiate: local stream not ready");
      return;
    }

    const readyIds = new Set(Array.from(readyMemberIds || []).map(Number));

    const remoteParticipants = participants.filter((participant) => {
      const memberId = Number(participant.member?.id ?? participant.member_id);

      return memberId !== Number(this.localMemberId) && readyIds.has(memberId);
    });

    console.log("[WebRTC] Signaling-ready participants:", remoteParticipants);

    for (const participant of remoteParticipants) {
      const remoteMemberId = Number(
        participant.member?.id ?? participant.member_id,
      );

      if (!remoteMemberId) {
        continue;
      }

      /*
       * Deterministic initiator.
       *
       * Only lower member ID creates the offer.
       */
      if (Number(this.localMemberId) < remoteMemberId) {
        if (
          this.offerCreated.has(remoteMemberId) ||
          this.offerInProgress.has(remoteMemberId)
        ) {
          continue;
        }

        console.log(
          "[WebRTC] Creating offer for signaling-ready member:",
          remoteMemberId,
        );

        await this.createOffer(remoteMemberId);
      }
    }
  }

  async addParticipant(participant) {
    if (!this.localStream) {
      return;
    }

    const remoteMemberId = Number(
      participant.member?.id ?? participant.member_id,
    );

    if (!remoteMemberId) {
      return;
    }

    if (remoteMemberId === Number(this.localMemberId)) {
      return;
    }

    if (Number(this.localMemberId) < remoteMemberId) {
      await this.createOffer(remoteMemberId);
    }
  }

  removePeer(memberId) {
    memberId = Number(memberId);

    const peer = this.peers.get(memberId);

    if (!peer) {
      return;
    }

    peer.connection.ontrack = null;
    peer.connection.onicecandidate = null;
    peer.connection.onconnectionstatechange = null;

    peer.connection.close();

    this.peers.delete(memberId);

    this.offerInProgress.delete(memberId);
    this.offerCreated.delete(memberId);
    this.pendingIceCandidates.delete(memberId);

    this.onRemoteStreamRemoved?.(memberId);
  }

  removeAllPeers() {
    for (const memberId of this.peers.keys()) {
      this.removePeer(memberId);
    }
  }

  stopLocalStream() {
    if (!this.localStream) {
      return;
    }

    this.localStream.getTracks().forEach((track) => {
      track.stop();
    });

    this.localStream = null;
  }

  destroy() {
    this.removeAllPeers();

    // useLocalMedia owns and stops the MediaStream.
    this.localStream = null;
  }
}
