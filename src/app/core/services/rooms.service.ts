import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Room {
  id: string;
  roomId: string;
  name?: string;
  creatorId: string;
  isActive: boolean;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  participantsCount?: number | null;
  creator?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export interface CreateRoomDto {
  name?: string;
  maxParticipants?: number;
}

export interface RoomParticipant {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  socketId?: string;
  webrtcSocketId?: string;
  isActive: boolean;
  joinedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomsService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Создание новой комнаты
   */
  createRoom(data: CreateRoomDto = {}): Observable<Room> {
    return this.http
      .post<ApiResponse<Room>>(`${this.API_URL}/rooms`, data, {
        withCredentials: true,
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Получение информации о комнате
   */
  getRoom(roomId: string): Observable<Room> {
    return this.http
      .get<ApiResponse<Room>>(`${this.API_URL}/rooms/${roomId}`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Получение комнат текущего пользователя
   */
  getMyRooms(): Observable<Room[]> {
    return this.http
      .get<ApiResponse<Room[]>>(`${this.API_URL}/rooms/my`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Получение списка участников комнаты
   */
  getParticipants(roomId: string): Observable<RoomParticipant[]> {
    return this.http
      .get<ApiResponse<RoomParticipant[]>>(`${this.API_URL}/rooms/${roomId}/participants`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Закрытие комнаты
   */
  closeRoom(roomId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.API_URL}/rooms/${roomId}`, {
        withCredentials: true,
      })
      .pipe(map(() => void 0));
  }
}

