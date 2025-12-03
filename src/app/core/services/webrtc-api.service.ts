import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

interface IceServersResponse {
  iceServers: RTCIceServer[];
}

@Injectable({
  providedIn: 'root',
})
export class WebrtcApiService {
  private readonly apiUrl = environment.apiUrl;
  private iceServers$?: Observable<RTCIceServer[]>;

  constructor(private readonly http: HttpClient) {}

  getIceServers(): Observable<RTCIceServer[]> {
    if (!this.iceServers$) {
      this.iceServers$ = this.http
        .get<IceServersResponse>(`${this.apiUrl}/webrtc/ice-servers`, {
          withCredentials: true,
        })
        .pipe(
          map((response) => response?.iceServers ?? []),
          catchError((error) => {
            console.error('[WebRTC API] Failed to fetch ICE servers', error);
            return of([]);
          }),
          shareReplay(1),
        );
    }

    return this.iceServers$;
  }
}

