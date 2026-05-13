export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  PAGO_FALLIDO = 'PAGO_FALLIDO'
}

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  ENVIADO = 'ENVIADO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export interface OrderItem {
  id?: number;
  nombreProducto: string;
  imagenDestacada?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}