import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss']
})
export class CtaComponent {
  readonly Check = Check;
}