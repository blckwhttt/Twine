import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  ActivatedRoute,
  Router,
} from '@angular/router';
import { LucideAngularModule, Settings, X, LogOut } from 'lucide-angular';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import {
  getActiveCategories,
  getSectionsByCategory,
  getSectionByRoute,
  SettingSection,
  SettingCategoryConfig,
} from './settings.config';
import { Subject, takeUntil } from 'rxjs';
import { SettingsAudioComponent } from '../settings-audio/settings-audio.component';
import { PersonalizationSettingsComponent } from '../settings-personalization/settings-personalization.component';

@Component({
  selector: 'app-settings-container',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    ModalComponent,
    SettingsAudioComponent,
    PersonalizationSettingsComponent
  ],
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
})
export class SettingsContainerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly Settings = Settings;
  readonly X = X;
  readonly LogOut = LogOut;

  isOpen = false;
  
  // Конфигурация настроек
  categories: SettingCategoryConfig[] = [];
  currentSection: SettingSection | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Открываем модальное окно при инициализации
    this.isOpen = true;

    // Загружаем категории
    this.categories = getActiveCategories();

    // Подписываемся на изменения query params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const sectionId = params['section'];
        
        if (!sectionId) {
          // Если секция не выбрана, переходим на аудио по умолчанию
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { section: 'audio' },
            replaceUrl: true
          });
          return;
        }

        this.currentSection = getSectionByRoute(sectionId) || null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Получить разделы для конкретной категории
   */
  getSectionsForCategory(categoryId: string): SettingSection[] {
    return getSectionsByCategory(categoryId as any);
  }

  /**
   * Закрыть настройки
   */
  close(): void {
    this.isOpen = false;
    // Даем время для анимации закрытия
    setTimeout(() => {
      // Navigate up to the call room (parent route)
      this.router.navigate(['../'], { relativeTo: this.route });
    }, 250);
  }
}
