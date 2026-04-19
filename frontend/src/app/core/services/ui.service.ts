import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UiService {
  private carritoVisibleSubject = new BehaviorSubject<boolean>(false);
  carritoVisible$ = this.carritoVisibleSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  toast(mensaje: string) {
    this.snackBar.open(mensaje, 'OK', {
      duration: 2500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['toast-success']
    });
  }
  
  mostrarCarrito(valor: boolean) {
    this.carritoVisibleSubject.next(valor);
  }

  ocultarCarrito(valor: boolean) {
    this.carritoVisibleSubject.next(valor);
  }

  toggleCarrito() {
    this.carritoVisibleSubject.next(!this.carritoVisibleSubject.getValue());
  }
}
