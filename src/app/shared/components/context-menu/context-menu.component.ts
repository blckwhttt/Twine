import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: any;
  type?: 'button' | 'slider' | 'divider';
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  customContent?: boolean;
  onClick?: (id: string) => void;
  onChange?: (id: string, value: number) => void;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isRendered) {
    <div class="fixed inset-0 z-50" (click)="close()" (contextmenu)="$event.preventDefault()">
      <div
        [style.left.px]="adjustedPosition.x"
        [style.top.px]="adjustedPosition.y"
        class="absolute min-w-[200px] bg-black/40 backdrop-blur-xl rounded-[12px] shadow-2xl transition-all duration-100 origin-top-left"
        [class.opacity-0]="!isVisible"
        [class.scale-95]="!isVisible"
        (click)="$event.stopPropagation()"
        (contextmenu)="$event.preventDefault()"
      >
        <div class="py-2">
          @for (item of items; track item.id) { @if (item.type === 'divider') {
          <div class="h-px bg-white/5 my-1 mx-2"></div>
          } @else if (item.type === 'slider') {
          <div class="px-3 py-2">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                @if (item.icon) {
                <lucide-icon [img]="item.icon" [size]="16" class="text-white/60"></lucide-icon>
                }
                <span class="text-sm text-white/70">{{ item.label }}</span>
              </div>
              <span class="text-xs text-white/50">{{ item.value }}%</span>
            </div>
            <input
              type="range"
              [min]="item.min || 0"
              [max]="item.max || 100"
              [step]="item.step || 1"
              [value]="item.value || 50"
              (input)="onSliderChange(item.id, $event)"
              (click)="$event.stopPropagation()"
              class="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-violet-500
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:transition-all
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-moz-range-thumb]:w-3
                         [&::-moz-range-thumb]:h-3
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-violet-500
                         [&::-moz-range-thumb]:border-0
                         [&::-moz-range-thumb]:cursor-pointer
                         [&::-moz-range-thumb]:transition-all
                         [&::-moz-range-thumb]:hover:scale-110"
              [disabled]="item.disabled"
            />
          </div>
          } @else if (item.customContent) {
          <div (click)="onItemClick(item)">
            <ng-content [select]="'[slot=' + item.id + ']'"></ng-content>
          </div>
          } @else {
          <button
            type="button"
            (click)="onItemClick(item)"
            [disabled]="item.disabled"
            class="w-full px-3 py-2 flex items-center gap-3 text-white/70 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            @if (item.icon) {
            <lucide-icon [img]="item.icon" [size]="16"></lucide-icon>
            }
            <span class="text-sm">{{ item.label }}</span>
          </button>
          } }
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      :host ::ng-deep [slot] {
        display: block;
      }
    `,
  ],
})
export class ContextMenuComponent implements OnChanges {
  /**
   * Управляет видимостью контекстного меню
   */
  @Input() isOpen = false;

  /**
   * Позиция меню (координаты клика)
   */
  @Input() position: ContextMenuPosition = { x: 0, y: 0 };

  /**
   * Элементы меню
   */
  @Input() items: ContextMenuItem[] = [];

  /**
   * Событие клика на элемент меню
   */
  @Output() itemClicked = new EventEmitter<ContextMenuItem>();

  /**
   * Событие изменения слайдера
   */
  @Output() sliderChanged = new EventEmitter<{ itemId: string; value: number }>();

  /**
   * Событие закрытия меню
   */
  @Output() closed = new EventEmitter<void>();

  isRendered = false;
  isVisible = false;
  adjustedPosition: ContextMenuPosition = { x: 0, y: 0 };

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.openMenu();
      } else {
        this.closeMenu();
      }
    }

    if (changes['position'] && this.isOpen) {
      this.adjustPosition();
    }
  }

  /**
   * Обработчик нажатия клавиши Escape
   */
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  /**
   * Открытие меню с анимацией
   */
  private openMenu(): void {
    this.isRendered = true;
    this.adjustPosition();
    // Небольшая задержка для корректной анимации появления
    setTimeout(() => {
      this.isVisible = true;
    }, 10);
  }

  /**
   * Закрытие меню с анимацией
   */
  private closeMenu(): void {
    this.isVisible = false;
    // Ожидание завершения анимации перед удалением из DOM
    setTimeout(() => {
      this.isRendered = false;
    }, 200);
  }

  /**
   * Закрытие меню
   */
  close(): void {
    this.closed.emit();
  }

  /**
   * Обработчик клика на элемент меню
   */
  onItemClick(item: ContextMenuItem): void {
    if (item.disabled) {
      return;
    }

    // Вызываем callback если он есть
    if (item.onClick) {
      item.onClick(item.id);
    }

    // Эмитим событие для родителя
    this.itemClicked.emit(item);

    this.close();
  }

  /**
   * Обработчик изменения слайдера
   */
  onSliderChange(itemId: string, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    // Находим элемент и вызываем его callback
    const item = this.items.find((i) => i.id === itemId);
    if (item?.onChange) {
      item.onChange(itemId, value);
    }

    // Эмитим событие для родителя
    this.sliderChanged.emit({ itemId, value });
  }

  /**
   * Корректировка позиции меню, чтобы оно не выходило за границы экрана
   */
  private adjustPosition(): void {
    const menuWidth = 220; // Примерная ширина меню
    const menuHeight = this.items.length * 40; // Примерная высота

    let x = this.position.x;
    let y = this.position.y;

    // Проверяем, не выходит ли меню за правую границу экрана
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }

    // Проверяем, не выходит ли меню за нижнюю границу экрана
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    // Проверяем минимальные отступы
    x = Math.max(10, x);
    y = Math.max(10, y);

    this.adjustedPosition = { x, y };
  }
}
