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

    this.addLocalTracks(peer);

    connection.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      this.sendSignal({
        type: "webrtc_ice_candidate",
        target_member_id: memberId,
        candidate: event.candidate,
      });
    };

    connection.ontrack = (event) => {
      const [stream] = event.streams;

      if (!stream) {
        return;
      }

      this.onRemoteStream?.({
        memberId,
        stream,
      });
    };

    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;

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
    const peer = await this.createPeer(memberId);

    const offer = await peer.connection.createOffer();

    await peer.connection.setLocalDescription(offer);

    this.sendSignal({
      type: "webrtc_offer",
      target_member_id: Number(memberId),
      sdp: offer.sdp,
    });
  }

  async handleOffer({ from_member_id, sdp }) {
    const memberId = Number(from_member_id);

    const peer = await this.createPeer(memberId);

    await peer.connection.setRemoteDescription(
      new RTCSessionDescription({
        type: "offer",
        sdp,
      }),
    );

    const answer = await peer.connection.createAnswer();

    await peer.connection.setLocalDescription(answer);

    this.sendSignal({
      type: "webrtc_answer",
      target_member_id: memberId,
      sdp: answer.sdp,
    });
  }

  async handleAnswer({ from_member_id, sdp }) {
    const memberId = Number(from_member_id);

    const peer = this.getPeer(memberId);

    if (!peer) {
      console.warn("Received answer for unknown peer:", memberId);

      return;
    }

    await peer.connection.setRemoteDescription(
      new RTCSessionDescription({
        type: "answer",
        sdp,
      }),
    );
  }

  async handleIceCandidate({ from_member_id, candidate }) {
    const memberId = Number(from_member_id);

    const peer = await this.createPeer(memberId);

    await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async connectToParticipants(participants) {
    if (!this.localStream) {
      return;
    }

    const remoteParticipants = participants.filter(
      (participant) =>
        Number(participant.member?.id ?? participant.member_id) !==
        Number(this.localMemberId),
    );

    for (const participant of remoteParticipants) {
      const remoteMemberId = Number(
        participant.member?.id ?? participant.member_id,
      );

      if (Number(this.localMemberId) < remoteMemberId) {
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
