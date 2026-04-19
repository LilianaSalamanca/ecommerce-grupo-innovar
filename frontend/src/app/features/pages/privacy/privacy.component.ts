import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy',
  imports: [CommonModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit{

  activeIndex: number | null = null;

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  privacy = [
    {
      title: 'Información que recopilamos',
      text: 'Recopilamos datos como nombre, correo, dirección y detalles de compra para procesar pedidos y mejorar la experiencia.'
    },
    {
      title: 'Uso de la información',
      text: 'Usamos tu información para procesar pedidos, mejorar nuestros servicios y brindar soporte al cliente.'
    },
    {
      title: 'Protección de datos',
      text: 'Implementamos medidas de seguridad para proteger tu información contra accesos no autorizados.'
    },
    {
      title: 'Pagos',
      text: 'Los pagos son procesados por proveedores externos como Wompi. No almacenamos datos de tarjetas.'
    },
    {
      title: 'Cookies',
      text: 'Usamos cookies para mejorar la navegación, analizar tráfico y personalizar contenido.'
    },
    {
      title: 'Compartir información',
      text: 'No vendemos ni compartimos tu información personal con terceros, excepto cuando es necesario para el funcionamiento del servicio.'
    },
    {
      title: 'Derechos del usuario',
      text: 'Puedes solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento.'
    }
  ];

  toggle(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}