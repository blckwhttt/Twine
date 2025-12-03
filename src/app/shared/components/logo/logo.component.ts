import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 logo-with-animation" [class]="wrapperClass">
      <img
        src="logo.png"
        alt="Hello, it's me"
        [style.width.px]="size"
        [style.height.px]="size"
        draggable="false"
      />
      @if (showText) {
      <span
        [class]="textClass"
        class="font-bold whitespace-nowrap bg-linear-to-r from-violet-300 to-violet-200/90 bg-clip-text text-transparent cursor-default"
      >
        {{ text }}
      </span>
      } @if (showBeta) {
      <span class="ml-2 text-white/45 text-xs font-mono -mb-1 cursor-default">Beta 0.2.1</span>
      }
    </div>
  `,
  styles: [],
})
export class LogoComponent {
  /**
   * Размер изображения логотипа в пикселях
   */
  @Input() size: number = 38;

  /**
   * Показывать ли текст рядом с логотипом
   */
  @Input() showText = true;

  /**
   * Текст логотипа
   */
  @Input() text = "Hello, it's me";

  /**
   * Дополнительные CSS классы для обертки
   */
  @Input() wrapperClass = '';

  /**
   * Дополнительные CSS классы для текста
   */
  @Input() textClass = 'text-[22px] -mb-1';

  /**
   * Показывать ли текст Beta
   */
  @Input() showBeta = false;
}
