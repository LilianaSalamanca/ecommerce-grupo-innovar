import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-whatsapp-button',
  templateUrl: './whatsapp-button.component.html',
  styleUrls: ['./whatsapp-button.component.scss']
})
export class WhatsappButtonComponent {

  phoneNumber = '573133668716';

  message = 'Hola, quiero más información sobre sus productos';
  producto: any;

  constructor(private router: Router) {
    this.setMessage(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setMessage(event.urlAfterRedirects);
      });
  }

  private setMessage(url: string) {

    if (url.includes('productos')) {
      this.message = 'Hola, estoy interesado en este producto, ¿me puedes dar más información?';
    } 
    else if (url.includes('cart')) {
      this.message = 'Hola, tengo dudas antes de realizar el pago';
    } 
    else if (url.includes('orders')) {
      this.message = 'Hola, necesito información sobre mi pedido';
    } 
    else {
      this.message = 'Hola, quiero más información sobre sus productos';
    }
  }

  get whatsappLink(): string {
    return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
  }
}