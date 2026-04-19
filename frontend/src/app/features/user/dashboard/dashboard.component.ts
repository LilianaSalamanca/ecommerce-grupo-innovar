import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { OrdersService, Order } from '@core/services/orders.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, 
            RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{

  private auth = inject(AuthService);
  private ordersService = inject(OrdersService);

  user = this.auth.user$;
  router = inject(Router);

  orders$ = this.ordersService.getOrders();

  totalOrders$ = this.orders$.pipe(
    map(orders => orders.length)
  );

  ordersInProgress$ = this.orders$.pipe(
    map(orders =>
      orders.filter(o =>
        ['PENDIENTE', 'PROCESANDO'].includes(o.estadoPedido)
      ).length
    )
  );

  ordersShipped$ = this.orders$.pipe(
    map(orders =>
      orders.filter(o => o.estadoPedido === 'ENVIADO').length
    )
  );

  lastOrders$ = this.orders$.pipe(
    map(orders => orders.slice(0, 3))
  );

  ngOnInit() {
    window.scrollTo(0, 0)

    if (!this.auth.getToken()) {
      this.router.navigate(['/login']);
    }
  }
}
