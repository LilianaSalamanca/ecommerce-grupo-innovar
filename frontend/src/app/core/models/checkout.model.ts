/* ---------- Interfaces que reflejan tu backend ---------- */

import { Producto } from "./producto.model";

export interface CheckoutItem {
  productoId: number;
  cantidad: number;
}

export interface CheckoutRequest {
  // Datos de contacto / envío
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigoPostal?: string;

  usuarioId?: number | null;          // opcional (si el usuario ya existe)
  metodoPago: "WOMPI" | "CONTRA_ENTREGA";
  items: CheckoutItem[];     
  totalFront?: number;
}

export interface DetallePedidoResponse {
  id: number;
  producto: any;               // Ajusta si creas un DTO específico
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
}

export interface PedidoResponse {
  id: number;
  estadoPedido: string;
  metodoPago: string;
  subtotal: string;
  costoEnvio: string;
  total: string;
  direccionEnvio: string;
  ciudadEnvio: string;
  departamentoEnvio: string;
  codigoPostalEnvio?: string;
  fechaCreacion: string;
  detalles: DetallePedidoResponse[];
}

export type MetodoPago = 'WOMPI' | 'CONTRA_ENTREGA';

export interface DatosCliente {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigoPostal?: string;
  usuarioId?: number | null;
}

export interface CheckoutState {
  paso: 1 | 2 | 3;                 // 1: Carrito, 2: Datos, 3: Pago
  datosCliente?: DatosCliente;
  metodoPago?: MetodoPago;
  subtotal: number;
  costoEnvio: number;
  total: number;
  envioGratis: boolean;
  items: {
    producto: Producto;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    mayorista: boolean;
  }[];
  pedidoConfirmado?: PedidoResponse;
  cargando: boolean;
  error?: string;
}

export interface CheckoutResponse {
  pedidoId: number;        
  total: number;
  subtotal: number;
  costoEnvio: number;
  estadoPedido: string;
  metodoPago: string;
  fechaCreacion: string;

  wompiUrl?: string;
  amountInCents?: number;
  wompiPublicKey?: string;
  integritySignature?: string;
  reference?: string;

  items: CheckoutItemResponse[];
}

export interface CheckoutItemResponse {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface TotalesCalculados {
    subtotal: number;
    costoEnvio: number;
    total: number;
    items: CheckoutItem[];
}
