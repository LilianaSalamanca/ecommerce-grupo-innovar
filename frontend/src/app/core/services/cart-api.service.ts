import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartApiService {

  private apiUrl = `${environment.apiUrl}/api/cart`;

  constructor(
    private http: HttpClient
  ) {}

  getCart(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  addItem(productoId: number, cantidad: number) {
    return this.http.post(
      `${this.apiUrl}/add`,
      { productoId, cantidad }
    );
    }

  updateItem(productoId: number, cantidad: number) {
    return this.http.put(
      `${this.apiUrl}/update`,
      { productoId, cantidad }
    );
  }

  clearCart(): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/clear`
    );
  }

  syncCart(items: any[]) {
    return this.http.post(
      `${this.apiUrl}/sync`,
      items
    );
  }

  deleteItem(productoId: number) {
    return this.http.delete(
      `${this.apiUrl}/remove/${productoId}`
    );
  }
}