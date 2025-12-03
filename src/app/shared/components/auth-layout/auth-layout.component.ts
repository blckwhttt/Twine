import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  template: `
    <div class="min-h-screen bg-[#131216] relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 bg-linear-to-br from-violet-950/20 via-[#131216] to-violet-950/10"></div>
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      </div>
      
      <!-- Content -->
      <div class="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div class="w-full max-w-md">
          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="flex items-center justify-center mb-3">
              <app-logo
                [size]="42"
                [text]="title"
                textClass="text-4xl"
              ></app-logo>
            </div>
            <p class="text-white/40 text-sm">Общение стало качественным и бесплатным</p>
          </div>
          
          <!-- Card -->
          <div class="bg-black/40 backdrop-blur-xl rounded-[14px] border border-white/5 shadow-2xl p-8">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer Link -->
          @if (footerText && footerLink && footerLinkText) {
            <div class="mt-6 text-center">
              <p class="text-white/50 text-sm">
                {{ footerText }}
                <a 
                  [routerLink]="footerLink" 
                  class="text-violet-400 hover:text-violet-300 font-semibold ml-1 transition-colors"
                >
                  {{ footerLinkText }}
                </a>
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent {
  @Input() title = 'Hello, it\'s me';
  @Input() footerText = '';
  @Input() footerLink = '';
  @Input() footerLinkText = '';
}

