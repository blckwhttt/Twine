import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getContainerClasses()">
      <div [class]="getSpinnerClasses()"></div>
      @if (message) {
        <p class="mt-4 text-sm text-white/50 font-medium">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .spinner {
      animation: spin 1s linear infinite;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message = '';
  @Input() fullScreen = false;

  getContainerClasses(): string {
    const baseClasses = 'flex flex-col items-center justify-center';
    const fullScreenClasses = this.fullScreen 
      ? 'fixed inset-0 bg-[#131216] z-50' 
      : '';
    
    return `${baseClasses} ${fullScreenClasses}`;
  }

  getSpinnerClasses(): string {
    const sizeClasses = {
      sm: 'w-8 h-8 border-2',
      md: 'w-12 h-12 border-3',
      lg: 'w-16 h-16 border-4'
    };
    
    return `spinner ${sizeClasses[this.size]} border-white/10 border-t-violet-500 rounded-full`;
  }
}

