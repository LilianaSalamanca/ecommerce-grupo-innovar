export interface Promocion {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  botonTexto: string;
  botonLink: string;
  activa: boolean;
  prioridad: number;
}