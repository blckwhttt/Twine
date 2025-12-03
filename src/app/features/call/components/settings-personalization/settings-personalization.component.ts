import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  UserRound,
  UploadCloud,
  Shield,
  Sparkles,
  Clock,
  Check,
  Loader2,
  ChevronDown,
  Pencil,
} from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { AvatarDecoration, User } from '../../../../core/models/user.model';
import { environment } from '../../../../../environments/environment';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { firstValueFrom } from 'rxjs';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

@Component({
  selector: 'app-personalization-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AvatarComponent],
  templateUrl: './settings-personalization.component.html',
  styleUrls: ['./settings-personalization.component.scss'],
})
export class PersonalizationSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('decorationsTrigger') decorationsTrigger?: ElementRef<HTMLDivElement>;

  readonly UserRound = UserRound;
  readonly UploadCloud = UploadCloud;
  readonly Shield = Shield;
  readonly Sparkles = Sparkles;
  readonly Clock = Clock;
  readonly Check = Check;
  readonly Loader2 = Loader2;
  readonly ChevronDown = ChevronDown;
  readonly Pencil = Pencil;

  private readonly authService = inject(AuthService);
  readonly currentUser$ = this.authService.currentUser$;
  readonly acceptMimeTypes = [
    'image/avif',
    'image/webp',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/heic',
    'image/heif',
  ];
  readonly acceptAttr = this.acceptMimeTypes.join(',');

  isDragging = false;
  uploadState: UploadState = 'idle';
  statusMessage = '';

  private statusTimeout?: ReturnType<typeof setTimeout>;
  private readonly assetBaseUrl: string;
  decorations: AvatarDecoration[] = [];
  isDecorationsPanelOpen = false;
  isDecorationsLoading = false;
  decorationsError: string | null = null;
  isDecorationUpdating = false;
  decorationUpdateError: string | null = null;
  private decorationsLoaded = false;

  isEditingDisplayName = false;
  tempDisplayName = '';
  isDisplayNameSaving = false;

  constructor() {
    const apiUrl = environment.apiUrl || '';
    this.assetBaseUrl = apiUrl.replace(/\/api\/?$/, '');
  }

  async ngOnInit(): Promise<void> {
    // Предзагрузка чтобы открыть поповер без задержек.
    await this.loadDecorations();
  }

  ngOnDestroy(): void {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.isDecorationsPanelOpen) {
      return;
    }
    const target = event.target as Node | null;
    const trigger = this.decorationsTrigger?.nativeElement;
    if (target && trigger?.contains(target)) {
      return;
    }
    this.isDecorationsPanelOpen = false;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isDecorationsPanelOpen) {
      this.isDecorationsPanelOpen = false;
    }
  }

  triggerFileDialog(): void {
    this.fileInput?.nativeElement.click();
  }

  async toggleDecorationsPanel(): Promise<void> {
    this.isDecorationsPanelOpen = !this.isDecorationsPanelOpen;
    if (this.isDecorationsPanelOpen) {
      await this.loadDecorations();
    }
  }

  async refreshDecorations(): Promise<void> {
    await this.loadDecorations(true);
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.handleFile(file);
    }
    if (input) {
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget === event.target) {
      this.isDragging = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  resolveAvatar(user: User | null): string | null {
    if (!user?.avatarUrl) {
      return null;
    }
    if (user.avatarUrl.startsWith('http')) {
      return user.avatarUrl;
    }
    return `${this.assetBaseUrl}${user.avatarUrl}`;
  }

  getDisplayName(user: User | null): string {
    if (!user) {
      return '—';
    }
    return user.displayName || user.username;
  }

  getInitial(user: User | null): string {
    if (!user) {
      return '?';
    }
    const source = this.getDisplayName(user);
    return source.charAt(0).toUpperCase();
  }

  getAllowedFormatsLabel(): string {
    return ['AVIF', 'WEBP', 'PNG', 'JPG', 'GIF', 'HEIC'].join(', ');
  }

  isDecorationActive(candidateUrl: string | null, user: User | null): boolean {
    const active = user?.decorationUrl ?? null;
    return active === candidateUrl;
  }

  async selectDecoration(decoration: AvatarDecoration | null, user: User | null): Promise<void> {
    if (this.isDecorationUpdating) {
      return;
    }

    const nextValue = decoration?.fileUrl ?? null;
    if (this.isDecorationActive(nextValue, user)) {
      return;
    }

    this.isDecorationUpdating = true;
    this.decorationUpdateError = null;

    try {
      await firstValueFrom(this.authService.updateDecoration(nextValue));
    } catch (error) {
      this.decorationUpdateError =
        this.extractErrorMessage(error) || 'Не удалось применить украшение. Попробуйте снова.';
    } finally {
      this.isDecorationUpdating = false;
    }
  }

  private async loadDecorations(force = false): Promise<void> {
    if (this.isDecorationsLoading) {
      return;
    }

    if (this.decorationsLoaded && !force) {
      return;
    }

    if (force) {
      this.decorationsLoaded = false;
    }

    this.isDecorationsLoading = true;
    this.decorationsError = null;

    try {
      this.decorations = await firstValueFrom(this.authService.getAvatarDecorations(force));
      this.decorationsLoaded = true;
    } catch (error) {
      this.decorationsError =
        this.extractErrorMessage(error) || 'Не удалось загрузить украшения. Попробуйте ещё раз.';
    } finally {
      this.isDecorationsLoading = false;
    }
  }

  private handleFile(file: File): void {
    const validationError = this.validateFile(file);
    if (validationError) {
      this.setStatus('error', validationError);
      return;
    }
    this.uploadAvatar(file);
  }

  private validateFile(file: File): string | null {
    if (!this.acceptMimeTypes.includes(file.type)) {
      return 'Формат не поддерживается. Допустимы AVIF, WEBP, GIF, PNG, JPG, HEIC.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Файл превышает 5 МБ. Уменьшите размер и попробуйте снова.';
    }
    return null;
  }

  private uploadAvatar(file: File): void {
    this.setStatus('uploading', 'Загружаем аватар, потребуется всего пару секунд...');
    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.setStatus('success', 'Аватар успешно обновлен!');
      },
      error: (err) => {
        const message =
          this.extractErrorMessage(err) ||
          'Не удалось загрузить аватар. Попробуйте ещё раз чуть позже.';
        this.setStatus('error', message);
      },
    });
  }

  private setStatus(state: UploadState, message: string): void {
    this.uploadState = state;
    this.statusMessage = message;
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    if (state === 'success' || state === 'error') {
      this.statusTimeout = setTimeout(() => {
        this.uploadState = 'idle';
        this.statusMessage = '';
      }, 5000);
    }
  }

  private extractErrorMessage(error: unknown): string | null {
    if (!error) {
      return null;
    }
    const message =
      (error as any)?.error?.message || (error as any)?.message || (error as any)?.statusText;
    return typeof message === 'string' ? message : null;
  }

  @ViewChild('displayNameInput') displayNameInput?: ElementRef<HTMLDivElement>;

  enableDisplayNameEdit(user: User | null): void {
    if (!user) {
      return;
    }
    this.isEditingDisplayName = true;
    this.tempDisplayName = user.displayName || user.username;
    
    // Даем Angular время отрисовать contenteditable=true
    setTimeout(() => {
      if (this.displayNameInput?.nativeElement) {
        this.displayNameInput.nativeElement.focus();
        // Ставим курсор в конец текста
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(this.displayNameInput.nativeElement);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }

  onDisplayNameBlur(user: User | null): void {
    // Небольшая задержка, чтобы успел сработать клик по кнопке сохранения, если он был
    setTimeout(() => {
      // Если мы не сохраняем сейчас, то просто отменяем редактирование
      if (!this.isDisplayNameSaving) {
        this.isEditingDisplayName = false;
        // Если были изменения, сбрасываем их (визуально текст вернется при перерисовке из user)
        this.tempDisplayName = user?.displayName || user?.username || '';
        // Принудительно обновляем текст в div, если angular не успел перерендерить
        if (this.displayNameInput?.nativeElement) {
          this.displayNameInput.nativeElement.innerText = this.getDisplayName(user);
        }
      }
    }, 150);
  }

  async saveDisplayName(user: User | null): Promise<void> {
    if (!user || this.isDisplayNameSaving) {
      return;
    }

    const trimmedName = this.tempDisplayName.trim();
    if (!trimmedName || trimmedName === (user.displayName || user.username)) {
      this.isEditingDisplayName = false;
      return;
    }

    this.isDisplayNameSaving = true;

    try {
      await firstValueFrom(this.authService.updateDisplayName(trimmedName));
      this.isEditingDisplayName = false;
    } catch (error) {
      this.setStatus('error', this.extractErrorMessage(error) || 'Не удалось сохранить имя');
    } finally {
      this.isDisplayNameSaving = false;
    }
  }

  hasDisplayNameChanged(user: User | null): boolean {
    if (!user) {
      return false;
    }
    const originalName = user.displayName || user.username;
    return this.tempDisplayName.trim() !== originalName;
  }

  onDisplayNameChange(event: Event): void {
    const target = event.target as HTMLElement;
    this.tempDisplayName = target.innerText;
  }
}
