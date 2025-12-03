import { Routes } from '@angular/router';

export const callRoutes: Routes = [
  {
    path: ':roomId',
    loadComponent: () => import('./call-room/call-room.component').then((m) => m.CallRoomComponent),
    children: [
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings-container/settings-container.component').then(
            (m) => m.SettingsContainerComponent
          ),
      },
    ],
  },
];
