import { Injectable } from '@angular/core';
import { Volume2, VolumeX, UserX, Settings } from 'lucide-angular';
import { ContextMenuBuilder } from '../../../shared/components/context-menu/context-menu.builder';
import { ContextMenuItem } from '../../../shared/components/context-menu/context-menu.component';
import { RoomParticipant } from '../../../core/services/websocket.service';

export interface ParticipantMenuCallbacks {
  onVolumeChange?: (participant: RoomParticipant, volume: number) => void;
  onMute?: (participant: RoomParticipant) => void;
  onKick?: (participant: RoomParticipant) => void;
  onViewProfile?: (participant: RoomParticipant) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ParticipantMenuService {
  /**
   * Создать меню для участника
   */
  createParticipantMenu(
    participant: RoomParticipant,
    options: {
      currentUserId: string;
      isRoomOwner?: boolean;
      currentVolume?: number;
      callbacks?: ParticipantMenuCallbacks;
    }
  ): ContextMenuItem[] {
    const { currentUserId, isRoomOwner = false, currentVolume = 100, callbacks } = options;
    const isCurrentUser = participant.id === currentUserId;

    return (
      ContextMenuBuilder.create()
        // Регулировка громкости (только для других участников)
        .addIf(!isCurrentUser, (menu) =>
          menu.addSlider({
            id: 'volume',
            label: 'Громкость',
            icon: Volume2,
            value: currentVolume,
            min: 0,
            max: 100,
            step: 5,
            onChange: (_, value) => {
              callbacks?.onVolumeChange?.(participant, value);
            },
          })
        )
        // Разделитель если есть элементы выше
        .addIf(!isCurrentUser, (menu) => menu.addDivider())
        // Быстрое отключение звука участника
        .addIf(!isCurrentUser, (menu) =>
          menu.addButton({
            id: 'mute-participant',
            label: 'Отключить звук',
            icon: VolumeX,
            onClick: () => {
              callbacks?.onMute?.(participant);
            },
          })
        )
        // Кик участника (только для владельца комнаты)
        .addIf(isRoomOwner && !isCurrentUser, (menu) =>
          menu.addDivider().addButton({
            id: 'kick',
            label: 'Исключить из комнаты',
            icon: UserX,
            onClick: () => {
              callbacks?.onKick?.(participant);
            },
          })
        )
        // Профиль участника
        .addGroup((menu) => {
          menu.addButton({
            id: 'view-profile',
            label: 'Просмотр профиля',
            icon: Settings,
            onClick: () => {
              callbacks?.onViewProfile?.(participant);
            },
          });
        })
        .build()
    );
  }

  /**
   * Обновить значение слайдера в существующем меню
   */
  updateSliderValue(items: ContextMenuItem[], sliderId: string, value: number): ContextMenuItem[] {
    return items.map((item) => {
      if (item.id === sliderId && item.type === 'slider') {
        return { ...item, value };
      }
      return item;
    });
  }
}
