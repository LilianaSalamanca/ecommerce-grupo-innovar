import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrdersService, Order } from '@core/services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  orders: Order[] = [];
  loading = true;

  constructor(
    private orderService: OrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0)
    
    this.orderService.getOrders().subscribe({
      next: (res) => {
        // ordenar aquí directamente (más reciente primero)
        this.orders = res.sort(
          (a, b) =>
            new Date(b.fechaCreacion).getTime() -
            new Date(a.fechaCreacion).getTime()
        );
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  viewDetails(id: number) {
    this.router.navigate(['/orders', id]);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}