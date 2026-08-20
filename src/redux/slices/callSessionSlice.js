import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  session: null,
  participant: null,
  participants: [],
  connected: false,
  socketConnected: false,

  localMedia: {
    audio: false,
    video: false,
    screen: false,
  },

  mediaReady: false,

  active: false,
  minimized: false,

  sessionSwitch: {
    status: "IDLE",
    targetSessionId: null,
    requestId: null,
  },
};

const callSessionSlice = createSlice({
  name: "callSession",

  initialState,

  reducers: {
    setCallSession(state, action) {
      state.session = action.payload;
      state.active = true;
    },

    setParticipant(state, action) {
      state.participant = action.payload;
    },

    setParticipants(state, action) {
      state.participants = action.payload;
    },

    addParticipant(state, action) {
      const exists = state.participants.some(
        (p) => p.member.id === action.payload.member.id,
      );

      if (!exists) {
        state.participants.push(action.payload);
      }
    },

    removeParticipant(state, action) {
      state.participants = state.participants.filter(
        (p) => p.member.id !== action.payload,
      );
    },

    updateParticipantMedia(state, action) {
      const { member_id, audio, video, screen } = action.payload;

      const participant = state.participants.find(
        (p) => p.member.id === member_id,
      );

      if (!participant) {
        return;
      }

      if (audio !== undefined) {
        participant.audio = audio;
      }

      if (video !== undefined) {
        participant.video = video;
      }

      if (screen !== undefined) {
        participant.screen = screen;
      }
    },

    setSocketConnected(state, action) {
      state.socketConnected = action.payload;
    },

    setLocalMedia(state, action) {
      state.localMedia = {
        ...state.localMedia,
        ...action.payload,
      };
    },

    setMediaReady(state, action) {
      state.mediaReady = action.payload;
    },

    setMinimized(state, action) {
      state.minimized = action.payload;
    },

    requestSessionSwitch(state, action) {
      state.sessionSwitch = {
        status: "REQUESTED",
        targetSessionId: action.payload.targetSessionId,
        requestId: action.payload.requestId,
      };
    },

    sessionSwitchReady(state, action) {
      if (state.sessionSwitch.requestId !== action.payload.requestId) {
        return;
      }

      state.sessionSwitch.status = "READY";
    },

    clearSessionSwitch(state) {
      state.sessionSwitch = {
        status: "IDLE",
        targetSessionId: null,
        requestId: null,
      };
    },

    clearCallSession(state) {
      state.session = null;
      state.participant = null;
      state.participants = [];
      state.connected = false;
      state.socketConnected = false;
      state.mediaReady = false;
      state.localMedia = {
        audio: false,
        video: false,
        screen: false,
      };
      state.active = false;
      state.minimized = false;
    },

    resetCallSession() {
      return initialState;
    },
  },
});

export const {
  setCallSession,
  clearCallSession,
  resetCallSession,

  setParticipant,
  setParticipants,

  addParticipant,
  removeParticipant,

  updateParticipantMedia,

  setSocketConnected,

  setLocalMedia,
  setMediaReady,

  setMinimized,

  requestSessionSwitch,
  sessionSwitchReady,
  clearSessionSwitch,
} = callSessionSlice.actions;

export default callSessionSlice.reducer;
