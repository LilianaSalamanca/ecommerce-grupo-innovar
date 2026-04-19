export interface OrderDetail {
  id: number;
  estadoPedido: string;
  metodoPago: string;
  estadoPago: string;
  referenciaPago: string;
  checkoutUrl: string;

  fechaCreacion: string;

  nombreCliente: string;
  apellidoCliente: string;
  emailCliente: string;
  telefonoCliente: string;

  direccionEnvio: string;
  ciudadEnvio: string;
  departamentoEnvio: string;

  subtotal: number;
  costoEnvio: number;
  total: number;

  detalles: any[];
}