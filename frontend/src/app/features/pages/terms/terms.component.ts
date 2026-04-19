import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terms',
  imports: [CommonModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit{

  lastUpdated = 'Abril 2026';

  activeIndex: number | null = null;

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  terms = [
    {
      title: 'Uso del sitio',
      text: 'Al acceder a este sitio aceptas cumplir con estos términos y la legislación vigente aplicable.'
    },
    {
      title: 'Productos',
      text: 'Los productos están sujetos a disponibilidad y pueden modificarse sin previo aviso.'
    },
    {
      title: 'Precios',
      text: 'Los precios pueden cambiar en cualquier momento. El precio final es el mostrado en checkout.'
    },
    {
      title: 'Pagos',
      text: 'Los pagos se procesan mediante pasarelas seguras como Wompi.'
    },
    {
      title: 'Envíos',
      text: 'Los tiempos de entrega son estimados y pueden variar según la ubicación.'
    },
    {
      title: 'Devoluciones',
      text: 'Las devoluciones aplican bajo condiciones específicas definidas por la tienda.'
    }
  ];

  toggle(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}