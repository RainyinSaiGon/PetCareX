import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.css']
})
export class ThemeSettingsComponent {
  colors = ['#234C6A', '#1B3C53', '#456882', '#0EA5A0', '#FB923C', '#8B5CF6'];

  open = false;
  constructor(public theme: ThemeService) {}

  toggleOpen() { this.open = !this.open; }
  pick(color: string) { this.theme.setAccent(color); }
  toggleMotion() { this.theme.setReducedMotion(!this.theme.getReducedMotion()); }
}
