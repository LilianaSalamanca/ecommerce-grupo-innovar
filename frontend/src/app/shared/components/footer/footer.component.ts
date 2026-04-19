import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FOOTER_DATA } from '@core/data/footer.data';
import { WhatsappButtonComponent } from "../whatsapp-button/whatsapp-button.component";

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, WhatsappButtonComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  footer = FOOTER_DATA;
  year = new Date().getFullYear();
}