import { Injectable } from '@angular/core';

export type ElectronSourceType = 'screen' | 'window';

export interface ElectronScreenSourceOptions {
  types?: ElectronSourceType[];
  thumbnailSize?: { width: number; height: number };
  fetchWindowIcons?: boolean;
}

export interface ElectronScreenSource {
  id: string;
  name: string;
  type: ElectronSourceType;
  displayId: string | null;
  thumbnail: string | null;
  appIcon: string | null;
}

interface ElectronBridgeAPI {
  isElectron?: boolean;
  onUpdateAvailable?: (...args: unknown[]) => void;
  onUpdateDownloaded?: (...args: unknown[]) => void;
  getScreenSources?: (
    options?: ElectronScreenSourceOptions
  ) => Promise<ElectronScreenSource[]>;
}

declare global {
  interface Window {
    electronAPI?: ElectronBridgeAPI;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private get bridge(): ElectronBridgeAPI | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return window.electronAPI;
  }

  isElectronApp(): boolean {
    return !!this.bridge?.isElectron;
  }

  async getScreenSources(
    options?: ElectronScreenSourceOptions
  ): Promise<ElectronScreenSource[]> {
    if (!this.bridge?.getScreenSources) {
      return [];
    }

    return this.bridge.getScreenSources(options);
  }
}

export {};

