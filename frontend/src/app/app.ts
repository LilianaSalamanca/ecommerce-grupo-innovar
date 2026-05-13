import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '@shared/components/navbar/navbar';
import { AuthService } from '@core/services/auth.service';
import { filter } from 'rxjs/operators';
import { WhatsappButtonComponent } from "@shared/components/whatsapp-button/whatsapp-button.component";
import { FooterComponent } from "@shared/components/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    CommonModule,
    WhatsappButtonComponent,
    FooterComponent
],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {

  isAdminRoute = false;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminRoute = event.urlAfterRedirects.startsWith('/admin');
      });
  } 

}