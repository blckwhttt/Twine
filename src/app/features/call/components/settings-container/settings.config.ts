import { Mic, Video, Bell, User, Palette, Shield, Sparkles } from 'lucide-angular';

/**
 * Категория раздела настроек
 */
export type SettingCategory = 'app' | 'user' | 'privacy';

/**
 * Интерфейс для раздела настроек
 */
export interface SettingSection {
  id: string;
  label: string;
  route: string;
  icon: any;
  category: SettingCategory;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

/**
 * Интерфейс для категории настроек
 */
export interface SettingCategoryConfig {
  id: SettingCategory;
  label: string;
  order: number;
}

/**
 * Конфигурация категорий
 */
export const SETTINGS_CATEGORIES: SettingCategoryConfig[] = [
  {
    id: 'app',
    label: 'Приложение',
    order: 1,
  },
  {
    id: 'user',
    label: 'Пользователь',
    order: 2,
  },
  {
    id: 'privacy',
    label: 'Безопасность',
    order: 3,
  },
];

/**
 * Конфигурация всех разделов настроек
 */
export const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: 'audio',
    label: 'Аудио и голос',
    route: 'audio',
    icon: Mic,
    category: 'app',
    title: 'Аудио и голос',
    description: 'Настройте параметры микрофона и обработки звука',
  },
  {
    id: 'video',
    label: 'Видео и камера',
    route: 'video',
    icon: Video,
    category: 'app',
    title: 'Видео и камера',
    description: 'Настройте параметры камеры и качество видео',
    badge: 'Скоро',
    disabled: true,
  },
  {
    id: 'notifications',
    label: 'Уведомления',
    route: 'notifications',
    icon: Bell,
    category: 'app',
    title: 'Уведомления',
    description: 'Управляйте звуками и всплывающими уведомлениями',
    badge: 'Скоро',
    disabled: true,
  },
  {
    id: 'personalization',
    label: 'Персонализация',
    route: 'personalization',
    icon: Sparkles,
    category: 'user',
    title: 'Персонализация профиля',
    description: 'Обновите карточку пользователя и загрузите новый аватар',
  },
  {
    id: 'profile',
    label: 'Профиль',
    route: 'profile',
    icon: User,
    category: 'user',
    title: 'Профиль пользователя',
    description: 'Изменяйте имя, аватар и другие персональные данные',
    badge: 'Скоро',
    disabled: true,
  },
  {
    id: 'appearance',
    label: 'Внешний вид',
    route: 'appearance',
    icon: Palette,
    category: 'user',
    title: 'Внешний вид',
    description: 'Настройте тему оформления и интерфейс приложения',
    badge: 'Скоро',
    disabled: true,
  },
  {
    id: 'privacy',
    label: 'Конфиденциальность',
    route: 'privacy',
    icon: Shield,
    category: 'privacy',
    title: 'Конфиденциальность и безопасность',
    description: 'Управляйте доступом к данным и настройками безопасности',
    badge: 'Скоро',
    disabled: true,
  },
];

/**
 * Получить разделы по категории
 */
export function getSectionsByCategory(category: SettingCategory): SettingSection[] {
  return SETTINGS_SECTIONS.filter((section) => section.category === category);
}

/**
 * Получить раздел по route
 */
export function getSectionByRoute(route: string): SettingSection | undefined {
  return SETTINGS_SECTIONS.find((section) => section.route === route);
}

/**
 * Получить все активные категории (которые имеют хотя бы один раздел)
 */
export function getActiveCategories(): SettingCategoryConfig[] {
  return SETTINGS_CATEGORIES.filter((category) =>
    SETTINGS_SECTIONS.some((section) => section.category === category.id)
  ).sort((a, b) => a.order - b.order);
}

