import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-white/70 mb-2">
          {{ label }}
          @if (required) {
            <span class="text-red-400">*</span>
          }
        </label>
      }
      <div class="relative">
        @if (icon) {
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <ng-content select="[slot=icon]"></ng-content>
          </div>
        }
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [class]="getInputClasses()"
        />
        @if (error && touched) {
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
            <lucide-icon [img]="AlertCircle" [size]="20"></lucide-icon>
          </div>
        }
      </div>
      @if (error && touched) {
        <p class="mt-2 text-sm text-red-400 flex items-center gap-1.5">
          <span class="text-xs">⚠</span>
          {{ error }}
        </p>
      }
      @if (hint && !error) {
        <p class="mt-2 text-xs text-white/30">{{ hint }}</p>
      }
    </div>
  `,
  styles: []
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() icon = false;

  readonly AlertCircle = AlertCircle;

  value = '';
  touched = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.touched = true;
  }

  getInputClasses(): string {
    const baseClasses = 'w-full px-4 py-2.5 bg-white/5 border rounded-[12px] text-white placeholder:text-white/30 transition-all duration-200 focus:outline-none focus:border-violet-500/30 focus:bg-[#16161f] disabled:opacity-50 disabled:cursor-not-allowed';
    const iconPadding = this.icon ? 'pl-10' : '';
    const errorClasses = this.error && this.touched 
      ? 'border-red-500/50 focus:border-red-500 pr-10' 
      : 'border-white/5';
    
    return `${baseClasses} ${iconPadding} ${errorClasses}`;
  }
}

