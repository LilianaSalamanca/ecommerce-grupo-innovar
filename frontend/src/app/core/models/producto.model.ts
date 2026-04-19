export interface Categoria {
  id: number;
  nombre: string;
}

export interface Subcategoria {
  id: number;
  nombre: string;
  categoria: Categoria;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioPublico: number;
  precioMayorista: number;
  marca: string;
  stock: number;
  imagenDestacada: string;
  referencia: string;
  categoria: Categoria;
  subcategoria: Subcategoria;
}
/**
 * DTO para crear/actualizar producto
 * Solo IDs de relaciones
 */
export interface ProductoDTO {
  referencia?: string;
  nombre: string;
  descripcion: string;
  precioPublico: number;
  precioMayorista: number;
  marca: string;
  stock: number;
  imagenDestacada: string;
  categoriaId: number;
  subcategoriaId: number;
}

/**
 * DTO para respuesta paginada
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

/**
 * DTO para respuesta de API
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
