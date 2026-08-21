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

  setLocalStream(stream) {
    this.localStream = stream;

    for (const peer of this.peers.values()) {
      this.addLocalTracks(peer);
    }
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
    };

    this.peers.set(memberId, peer);

    console.log("[WebRTC] PEER CREATED", {
      localMemberId: this.localMemberId,
      remoteMemberId: memberId,
    });

    this.addLocalTracks(peer);

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
        console.warn(
          `Failed to send ICE candidate to member ${memberId}: socket not ready`,
        );
      }
    };

    connection.ontrack = (event) => {
      console.log("[WebRTC] REMOTE TRACK", {
        memberId,
        kind: event.track.kind,
        id: event.track.id,
        readyState: event.track.readyState,
        enabled: event.track.enabled,
        streams: event.streams,
      });

      const [stream] = event.streams;

      if (!stream) {
        console.warn("[WebRTC] Remote track has no stream", {
          memberId,
          kind: event.track.kind,
        });
        return;
      }

      this.onRemoteStream?.({
        memberId,
        stream,
      });
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

  addLocalTracks(peer) {
    if (!this.localStream) {
      return;
    }

    const existingTrackIds = new Set(
      peer.connection
        .getSenders()
        .map((sender) => sender.track?.id)
        .filter(Boolean),
    );

    this.localStream.getTracks().forEach((track) => {
      if (existingTrackIds.has(track.id)) {
        return;
      }

      peer.connection.addTrack(track, this.localStream);
    });
  }

  async createOffer(memberId) {
    memberId = Number(memberId);

    const existingPeer = this.peers.get(memberId);

    if (existingPeer?.offerCreated) {
      console.log("[WebRTC] Offer already created for", memberId);

      return;
    }

    const peer = await this.createPeer(memberId);

    peer.offerCreated = true;

    console.log("[WebRTC] Creating offer for", memberId);

    const offer = await peer.connection.createOffer();

    await peer.connection.setLocalDescription(offer);

    const sent = this.sendSignal({
      type: "webrtc_offer",
      target_member_id: memberId,
      sdp: offer.sdp,
    });

    console.log(`[WebRTC] Offer sent to ${memberId}:`, sent);
  }

  async handleOffer({ from_member_id, sdp }) {
    const memberId = Number(from_member_id);

    console.log("[WebRTC] Handling offer from", memberId);

    const peer = await this.createPeer(memberId);

    try {
      await peer.connection.setRemoteDescription(
        new RTCSessionDescription({
          type: "offer",
          sdp,
        }),
      );

      /*
       * ICE may have arrived before the offer.
       */
      await this.flushIceCandidates(memberId);

      const answer = await peer.connection.createAnswer();

      await peer.connection.setLocalDescription(answer);

      const sent = this.sendSignal({
        type: "webrtc_answer",
        target_member_id: memberId,
        sdp: answer.sdp,
      });

      console.log(`[WebRTC] Answer sent to ${memberId}:`, sent);
    } catch (error) {
      console.error(`[WebRTC] Failed handling offer from ${memberId}:`, error);
    }
  }

  async handleAnswer({ from_member_id, sdp }) {
    const memberId = Number(from_member_id);

    console.log(`[WebRTC] Handling answer from ${memberId}`);

    const peer = this.getPeer(memberId);

    if (!peer) {
      console.warn(`[WebRTC] Received answer for unknown peer ${memberId}`);

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
    } catch (error) {
      console.error(
        `[WebRTC] Failed to handle answer from ${memberId}:`,
        error,
      );
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
    this.stopLocalStream();
  }
}
