export interface CallRoom {
  id: string;
  roomId: string;
  participants: CallParticipant[];
  createdAt: Date;
}

export interface CallParticipant {
  userId: string;
  username: string;
  displayName: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
  roomId: string;
}

