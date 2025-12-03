export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  decorationUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AvatarDecoration {
  id: string;
  name: string;
  fileUrl: string;
}
