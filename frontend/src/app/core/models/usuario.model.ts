export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  ciudad?: string;
  departamento?: string;
  direccion?: string;
  telefono?: string;
  codigo_postal?: string;
  tipo_usuario: 'PUBLICO' | 'MAYORISTA';
  activo?: boolean;
  password?: string;
  ultimoLogin?: string;
}
