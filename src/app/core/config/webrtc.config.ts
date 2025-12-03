type ExtendedMediaTrackConstraints = MediaTrackConstraints & {
  latency?: ConstrainDoubleRange;
  voiceIsolation?: ConstrainBoolean;
};

interface ScreenShareProfile {
  width: number;
  height: number;
  frameRate: number;
  label: string;
  description: string;
  maxBitrate: number;
  contentHint: 'detail' | 'motion';
}

interface AudioProfile {
  constraints: ExtendedMediaTrackConstraints;
  opusParams: Record<string, number | string>;
  sender: {
    maxBitrate: number;
    priority: RTCPriorityType;
    networkPriority: RTCPriorityType;
    dtx: boolean;
  };
  receiver?: {
    jitterBufferTargetMs?: number;
    playoutDelayHintMs?: number;
  };
}

const SCREEN_SHARE_PROFILES: Record<string, ScreenShareProfile> = {
  '1920p60': {
    width: 1920,
    height: 1080,
    frameRate: 60,
    label: '1920p60fps',
    description: 'Сбалансированное качество с умеренной нагрузкой',
    maxBitrate: 8000000,
    contentHint: 'detail',
  },
  '1920p120': {
    width: 1920,
    height: 1080,
    frameRate: 120,
    label: '1920p120fps',
    description: 'Максимально плавно, подходит для динамики',
    maxBitrate: 12000000,
    contentHint: 'motion',
  },
  '4k60': {
    width: 3840,
    height: 2160,
    frameRate: 60,
    label: '4k60fps',
    description: 'Ультра качество, повышенная нагрузка',
    maxBitrate: 16000000,
    contentHint: 'detail',
  },
  '4k120': {
    width: 3840,
    height: 2160,
    frameRate: 120,
    label: '4k120fps',
    description: 'Студийная четкость и плавность (требует мощный ПК)',
    maxBitrate: 25000000,
    contentHint: 'motion',
  },
};

const AUDIO_PROFILES: Record<string, AudioProfile> = {
  studio: {
    constraints: {
      sampleRate: 48000,
      channelCount: 2,
      latency: { ideal: 0.02, max: 0.12 },
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      voiceIsolation: { ideal: true },
    },
    opusParams: {
      maxaveragebitrate: 256000,
      stereo: 1,
      'sprop-stereo': 1,
      useinbandfec: 1,
      cbr: 0,
      dtx: 0,
      minptime: 10,
      maxptime: 60,
      ptime: 10,
      maxplaybackrate: 48000,
    },
    sender: {
      maxBitrate: 256000,
      priority: 'high',
      networkPriority: 'high',
      dtx: false,
    },
    receiver: {
      jitterBufferTargetMs: 120,
      playoutDelayHintMs: 180,
    },
  },
  balanced: {
    constraints: {
      sampleRate: 48000,
      channelCount: 1,
      latency: { ideal: 0.01, max: 0.08 },
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      voiceIsolation: { ideal: true },
    },
    opusParams: {
      maxaveragebitrate: 128000,
      stereo: 0,
      useinbandfec: 1,
      cbr: 0,
      dtx: 1,
      minptime: 10,
    },
    sender: {
      maxBitrate: 128000,
      priority: 'medium',
      networkPriority: 'medium',
      dtx: true,
    },
    receiver: {
      jitterBufferTargetMs: 80,
      playoutDelayHintMs: 120,
    },
  },
};

export type AudioProfileName = keyof typeof AUDIO_PROFILES;
export type ScreenShareQuality = keyof typeof SCREEN_SHARE_PROFILES;

export const WEBRTC_CONFIG = {
  audio: {
    codec: 'opus',
    defaultProfile: 'studio' as AudioProfileName,
    profiles: AUDIO_PROFILES,
  },
  screenShare: {
    defaultProfile: '1920p120' as ScreenShareQuality,
    profiles: SCREEN_SHARE_PROFILES,
  },
  ice: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:19302',
          'turns:openrelay.metered.ca:443?transport=tcp',
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
    iceCandidatePoolSize: 10,
  },
};
