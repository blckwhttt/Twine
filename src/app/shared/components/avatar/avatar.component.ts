import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <svg viewBox="0 0 100 100" class="size-full overflow-visible shrink-0">
        <defs>
          <mask [id]="maskId">
            <rect width="100" height="100" fill="white" />
          </mask>
        </defs>
        <foreignObject x="0" y="0" width="100" height="100" [attr.mask]="'url(#' + maskId + ')'">
          <div [class]="innerClasses">
            @if (currentSrc && !hasError) {
            <img
              [src]="currentSrc"
              [alt]="alt"
              loading="lazy"
              class="size-full object-cover"
              (error)="onError()"
            />
            } @else {
            <div [class]="placeholderClasses">
              {{ initials }}
            </div>
            }
          </div>
        </foreignObject>
        @if (showDecoration && decorationSrc) {
        <image
          [attr.href]="decorationSrc"
          x="-10"
          y="-10"
          width="120"
          height="120"
          class="pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        />
        }
      </svg>
    </div>
  `,
  styles: [],
})
export class AvatarComponent implements OnChanges {
  @Input() src?: string | null;
  @Input() alt: string = '';
  @Input() name: string = '';

  // Styling inputs with defaults matching common usage
  @Input() sizeClass: string = 'size-10';
  @Input() roundedClass: string = 'rounded-full';
  @Input() fontSizeClass: string = 'text-sm';
  @Input() placeholderClass: string =
    'bg-linear-to-br from-white/10 to-white/5 text-white/70 font-bold';
  @Input() wrapperClass: string = 'relative overflow-hidden'; // Extra wrapper classes if needed

  @Input() decorationSrc?: string | null;
  @Input() showDecoration = false;

  currentSrc?: string | null;
  hasError = false;

  readonly maskId = 'avatar-mask-' + Math.random().toString(36).substring(2, 9);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.currentSrc = this.src;
      this.hasError = false;
    }
  }

  onError(): void {
    this.hasError = true;
  }

  get containerClasses(): string {
    return `${this.sizeClass} relative select-none`;
  }

  get innerClasses(): string {
    return `relative size-full flex items-center justify-center ${this.roundedClass} ${this.wrapperClass}`;
  }

  get placeholderClasses(): string {
    return `size-full flex items-center justify-center ${this.placeholderClass} ${this.fontSizeClass}`;
  }

  get initials(): string {
    if (!this.name) return '';
    // If name is just one word or has no spaces, take first char.
    // If multiple words, could take first char of first two words,
    // but current app logic seems to mostly use just one char or simple logic.
    // Let's stick to the simple first char uppercase for now as seen in 'call-room.component.html'
    // (currentUser?.username?.charAt(0)?.toUpperCase())
    return this.name.charAt(0).toUpperCase();
  }
}
