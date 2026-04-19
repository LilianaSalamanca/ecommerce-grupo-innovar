import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit{

  activeIndex: number | null = null;

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  faqs = [
    {
      question: '¿Los productos son originales y cuentan con garantía?',
      answer: 'Sí, todos nuestros productos son 100% originales y cuentan con garantía. Trabajamos con proveedores confiables para asegurar calidad y respaldo en cada compra.'
    },
    {
      question: '¿Cuánto tarda el envío y a qué ciudades llegan?',
      answer: 'Realizamos envíos a nivel nacional. El tiempo de entrega es de 2 a 5 días hábiles dependiendo de tu ubicación.'
    },
    {
      question: '¿Puedo pagar contra entrega?',
      answer: 'Dependiendo de la ciudad, ofrecemos opciones de pago contra entrega. También puedes pagar de forma segura en línea.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito, débito y pagos en línea seguros. Todos los pagos están protegidos.'
    },
    {
      question: '¿Qué pasa si el producto llega dañado o defectuoso?',
      answer: 'Si tu producto presenta algún problema, puedes contactarnos y gestionamos el cambio o devolución de manera rápida y segura.'
    },
    {
      question: '¿Puedo devolver un producto si no es lo que esperaba?',
      answer: 'Sí, tienes un plazo para solicitar devoluciones. Nuestro equipo te guiará en el proceso para que sea fácil y sin complicaciones.'
    },
    {
      question: '¿Cómo hago seguimiento a mi pedido?',
      answer: 'Puedes consultar el estado de tu pedido desde tu cuenta o escribirnos por WhatsApp para atención inmediata.'
    },
    {
      question: '¿Tienen atención personalizada?',
      answer: 'Sí, ofrecemos atención directa por WhatsApp para resolver tus dudas y ayudarte a elegir el producto ideal.'
    },
    {
      question: '¿Los precios incluyen IVA?',
      answer: 'Sí, todos nuestros precios incluyen impuestos. No tendrás costos ocultos al momento de pagar.'
    },
    {
      question: '¿Qué hago si tengo dudas antes de comprar?',
      answer: 'Puedes escribirnos por WhatsApp y un asesor te ayudará en tiempo real para tomar la mejor decisión.'
    }
  ];

  toggle(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}