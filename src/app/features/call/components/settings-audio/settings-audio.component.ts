import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebrtcService } from '../../../../core/services/webrtc.service';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { LucideAngularModule, Mic, Radio, Info, RadioIcon } from 'lucide-angular';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-settings-audio',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective, LucideAngularModule, CustomSelectComponent],
  templateUrl: './settings-audio.component.html',
  styleUrls: ['./settings-audio.component.scss'],
})
export class SettingsAudioComponent implements OnInit {
  readonly Mic = Mic;
  readonly Radio = Radio;
  readonly Info = Info;
  readonly RadioIcon = RadioIcon;

  settings = {
    noiseSuppression: true,
    echoCancellation: true,
  };

  audioInputOptions: SelectOption[] = [];
  audioOutputOptions: SelectOption[] = [];
  selectedInputId = 'default';
  selectedOutputId = 'default';

  constructor(private webrtcService: WebrtcService) {}

  async ngOnInit(): Promise<void> {
    this.settings = this.webrtcService.getAudioProcessingSettings();
    await this.loadDevices();
  }

  async loadDevices(): Promise<void> {
    try {
      const devices = await this.webrtcService.getAudioDevices();
      
      this.audioInputOptions = this.formatDeviceOptions(devices.input, 'Микрофон');
      this.audioOutputOptions = this.formatDeviceOptions(devices.output, 'Динамики');

      const selected = this.webrtcService.getSelectedDevices();
      this.selectedInputId = selected.audioInputId;
      this.selectedOutputId = selected.audioOutputId;
    } catch (error) {
      console.error('Failed to load audio devices', error);
    }
  }

  private formatDeviceLabel(label: string): string {
    if (!label) return '';

    // 1. Удаляем техническую информацию в скобках в конце, например (3142:a008) или (Realtek Audio)
    // Но оставляем полезные названия, если они в скобках
    let clean = label.replace(/\s*\([0-9a-fA-F]{4}:[0-9a-fA-F]{4}\)$/, ''); 

    clean = clean.replace(/^Default - /, '').replace(/^По умолчанию - /, '');

    clean = clean.replace(/^\d+\s*-\s*/, '');

    return clean.trim();
  }

  private formatDeviceOptions(devices: MediaDeviceInfo[], defaultLabelPrefix: string): SelectOption[] {
    const options: SelectOption[] = [];
    
    // Находим устройство по умолчанию
    const defaultDevice = devices.find(d => d.deviceId === 'default');
    
    if (defaultDevice) {
      let cleanLabel = this.formatDeviceLabel(defaultDevice.label);
        
      if (!cleanLabel) {
        cleanLabel = 'По умолчанию';
      } else {
        cleanLabel = `По умолчанию: ${cleanLabel}`;
      }
      
      options.push({
        value: 'default',
        label: cleanLabel
      });
    } else {
       options.push({ value: 'default', label: 'По умолчанию' });
    }

    devices.forEach(device => {
      if (device.deviceId !== 'default') {
        let label = this.formatDeviceLabel(device.label);
        if (!label) {
            label = `${defaultLabelPrefix} ${device.deviceId.slice(0, 5)}...`;
        }
        
        options.push({
          value: device.deviceId,
          label: label
        });
      }
    });

    return options;
  }

  async onInputDeviceChange(deviceId: string): Promise<void> {
    this.selectedInputId = deviceId;
    try {
      await this.webrtcService.switchAudioDevice(deviceId);
    } catch (error) {
      console.error('Failed to switch input device', error);
    }
  }

  async onOutputDeviceChange(deviceId: string): Promise<void> {
    this.selectedOutputId = deviceId;
    try {
      await this.webrtcService.setAudioOutputDevice(deviceId);
    } catch (error) {
      console.error('Failed to switch output device', error);
    }
  }

  updateSettings(): void {
    this.webrtcService.updateAudioProcessing(this.settings);
  }
}
