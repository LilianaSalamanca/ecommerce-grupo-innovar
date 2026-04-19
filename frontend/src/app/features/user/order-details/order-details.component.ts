import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '@core/services/orders.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {

  order: any;
  loading = true;
  timelineSteps: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrdersService,
    private router: Router
    
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0)
    
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  };
}