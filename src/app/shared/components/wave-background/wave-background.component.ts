import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wave-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #canvas class="absolute inset-0 w-full h-full"></canvas>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 300px; /* Фиксированная высота, чтобы выходить за пределы хедера */
        overflow: hidden;
        background-color: transparent; /* Прозрачный фон, чтобы сливаться с body */
        pointer-events: none;
        /* Маска для плавного исчезновения снизу */
        mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
      }
    `,
  ],
})
export class WaveBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId!: number;
  private particles: Particle[] = [];
  private width = 0;
  private height = 0;
  private time = 0;

  // Настройки анимации
  private readonly PARTICLE_GAP = 10; // Расстояние между точками (было 15)
  private readonly WAVE_SPEED = 0.005; // Замедленная анимация (было 0.015)
  private readonly WAVE_AMPLITUDE = 30;
  private readonly MOUSE_RADIUS = 200;

  private mouseX = -1000;
  private mouseY = -1000;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initCanvas();
    this.createParticles();
    
    // Запускаем анимацию вне зоны Angular для производительности
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.initCanvas();
    this.createParticles();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // Получаем координаты относительно канваса
    if (this.canvasRef) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left;
      this.mouseY = event.clientY - rect.top;
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    
    // Устанавливаем размеры с учетом DPR для четкости
    this.width = window.innerWidth; // Ширина всегда во весь экран
    this.height = 300; // Фиксированная высота компонента
    
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    
    this.ctx = canvas.getContext('2d')!;
    this.ctx.scale(dpr, dpr);
  }

  private createParticles(): void {
    this.particles = [];
    const cols = Math.ceil(this.width / this.PARTICLE_GAP);
    const rows = Math.ceil(this.height / this.PARTICLE_GAP);

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        this.particles.push({
          x: i * this.PARTICLE_GAP,
          y: j * this.PARTICLE_GAP,
          baseX: i * this.PARTICLE_GAP,
          baseY: j * this.PARTICLE_GAP,
          size: Math.random() * 1.5 + 0.5, // Размер 0.5-2px
          // Белый и светло-фиолетовый с оптимальной непрозрачностью
          color: Math.random() > 0.6
            ? `rgba(255, 255, 255, ${0.15 + Math.random() * 0.35})` // Белый (0.15-0.5 opacity)
            : `rgba(221, 214, 255, ${0.15 + Math.random() * 0.35})`, // #ddd6ff (0.15-0.5 opacity)
          // Уникальный сдвиг фазы для каждой частицы для хаотичности
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          speedX: 0.002 + Math.random() * 0.004,
          speedY: 0.002 + Math.random() * 0.004
        });
      }
    }
  }

  private animate(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.time += this.WAVE_SPEED;

    this.particles.forEach(p => {
      // Более хаотичная и плавная формула движения
      // Используем индивидуальные фазы и скорости
      const waveX = Math.sin(this.time * p.speedX + p.phaseX) * this.WAVE_AMPLITUDE;
      const waveY = Math.cos(this.time * p.speedY + p.phaseY) * this.WAVE_AMPLITUDE;
      
      // Добавляем "шум" для непредсказуемости
      const noiseX = Math.sin(p.y * 0.02 + this.time) * 5;
      const noiseY = Math.cos(p.x * 0.02 + this.time) * 5;

      // Эффект мыши (отталкивание)
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let mouseEffectX = 0;
      let mouseEffectY = 0;

      if (distance < this.MOUSE_RADIUS) {
        const force = (this.MOUSE_RADIUS - distance) / this.MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        // Плавное затухание силы
        const power = Math.pow(force, 2);
        mouseEffectX = Math.cos(angle) * power * 40;
        mouseEffectY = Math.sin(angle) * power * 40;
      }

      // Итоговая позиция
      const finalX = p.baseX + waveX + noiseX - mouseEffectX;
      const finalY = p.baseY + waveY + noiseY - mouseEffectY;

      // Отрисовка
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.fillRect(finalX, finalY, p.size, p.size);
    });

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
}

