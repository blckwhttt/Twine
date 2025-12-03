import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, X, AlertTriangle, Info } from 'lucide-angular';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (show) {
      <div 
        [class]="getNotificationClasses()"
        class="fixed top-4 right-4 z-50 max-w-md animate-slide-in"
      >
        <div class="flex items-center gap-3 p-4">
          <!-- Icon -->
          <div [class]="getIconClasses()">
            @switch (type) {
              @case ('success') {
                <lucide-icon [img]="Check" [size]="20"></lucide-icon>
              }
              @case ('error') {
                <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
              }
              @case ('warning') {
                <lucide-icon [img]="AlertTriangle" [size]="20"></lucide-icon>
              }
              @case ('info') {
                <lucide-icon [img]="Info" [size]="20"></lucide-icon>
              }
            }
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            @if (title) {
              <h4 class="text-sm font-semibold text-white mb-1">{{ title }}</h4>
            }
            <p class="text-sm text-white/80">{{ message }}</p>
          </div>
          
          <!-- Close Button -->
          <button
            type="button"
            (click)="onClose()"
            class="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-[8px] shrink-0"
          >
            <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class NotificationComponent {
  @Input() show = false;
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() duration = 5000;
  
  @Output() closed = new EventEmitter<void>();

  readonly Check = Check;
  readonly XIcon = X;
  readonly AlertTriangle = AlertTriangle;
  readonly Info = Info;

  private timeout: any;

  ngOnChanges(): void {
    if (this.show && this.duration > 0) {
      this.timeout = setTimeout(() => {
        this.onClose();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  getNotificationClasses(): string {
    const baseClasses = 'rounded-xl border shadow-2xl backdrop-blur-xl';
    
    const typeClasses = {
      success: 'bg-emerald-900/90 border-emerald-700 shadow-emerald-900/50',
      error: 'bg-red-900/90 border-red-700 shadow-red-900/50',
      warning: 'bg-amber-900/90 border-amber-700 shadow-amber-900/50',
      info: 'bg-blue-900/90 border-blue-700 shadow-blue-900/50'
    };
    
    return `${baseClasses} ${typeClasses[this.type]}`;
  }

  getIconClasses(): string {
    const baseClasses = 'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center';
    
    const typeClasses = {
      success: 'bg-emerald-500/20 text-emerald-400',
      error: 'bg-red-500/20 text-red-400',
      warning: 'bg-amber-500/20 text-amber-400',
      info: 'bg-blue-500/20 text-blue-400'
    };
    
    return `${baseClasses} ${typeClasses[this.type]}`;
  }
}

