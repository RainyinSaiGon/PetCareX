import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'petcarex-theme';
  private accentKey = 'petcarex-accent';
  private motionKey = 'petcarex-reduced-motion';

  constructor() {
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.apply(saved);
      return;
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(prefersDark ? 'dark' : 'light');

    // load accent
    const accent = localStorage.getItem(this.accentKey);
    if (accent) {
      this.applyAccent(accent);
    }

    // load reduced motion preference
    const rm = localStorage.getItem(this.motionKey);
    if (rm) {
      this.applyReducedMotion(rm === 'true');
    }
  }

  toggle() {
    const current = this.get();
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem(this.storageKey, next);
  }

  set(theme: 'light' | 'dark') {
    this.apply(theme);
    localStorage.setItem(this.storageKey, theme);
  }

  get(): 'light' | 'dark' {
    const saved = localStorage.getItem(this.storageKey) as 'light' | 'dark' | null;
    if (saved) return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private apply(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    // also set body attribute for styling convenience
    document.body.setAttribute('data-theme', theme);
  }

  // Accent color management
  setAccent(hex: string) {
    localStorage.setItem(this.accentKey, hex);
    this.applyAccent(hex);
  }

  getAccent(): string | null {
    return localStorage.getItem(this.accentKey);
  }

  private applyAccent(hex: string) {
    document.documentElement.style.setProperty('--accent', hex);
  }

  // Reduced motion
  setReducedMotion(enabled: boolean) {
    localStorage.setItem(this.motionKey, String(enabled));
    this.applyReducedMotion(enabled);
  }

  getReducedMotion(): boolean {
    const rm = localStorage.getItem(this.motionKey);
    if (rm) return rm === 'true';
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private applyReducedMotion(enabled: boolean) {
    if (enabled) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
  }
}
