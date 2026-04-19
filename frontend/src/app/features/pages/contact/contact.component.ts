import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [ ReactiveFormsModule, CommonModule ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit{

    ngOnInit(): void {
        window.scrollTo(0, 0);
    }

  contactForm: FormGroup;
  isSent = false;

  private phoneNumber = '573133668716';

  constructor(private fb: FormBuilder) {

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      reason: ['pedido', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // ENVÍO PRINCIPAL (WhatsApp con formulario)
  sendMessage() {

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const data = this.contactForm.value;

    const message =
      `*Soporte Grupo Innovar*%0A%0A` +
      `Nombre: ${data.name}%0A` +
      `Email: ${data.email}%0A` +
      `Motivo: ${data.reason}%0A%0A` +
      `Mensaje:%0A${data.message}`;

    const url = `https://wa.me/${this.phoneNumber}?text=${message}`;

    this.isSent = true;

    window.open(url, '_blank');

    setTimeout(() => {
      this.isSent = false;
      this.contactForm.reset({
        reason: 'pedido'
      });
    }, 2000);
  }

  // WhatsApp directo sin formulario
  openWhatsAppDirect() {
    window.open(`https://wa.me/${this.phoneNumber}`, '_blank');
  }

  // Email fallback
  openEmail() {
    window.location.href =
      'mailto:grupoinnovarlyl@gmail.com?subject=Soporte%20Grupo%20Innovar';
  }
}