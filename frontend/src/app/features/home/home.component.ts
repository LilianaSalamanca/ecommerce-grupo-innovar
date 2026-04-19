import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsPageComponent } from '@features/products/products-page/products-page.component';
import { BannerComponent } from './banner/banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, 
            BannerComponent, 
            ProductsPageComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

}
