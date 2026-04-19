package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.dto.ProductoDTO;
import com.grupo_innovar.backend.model.Categoria;
import com.grupo_innovar.backend.model.Producto;
import com.grupo_innovar.backend.model.Subcategoria;
import com.grupo_innovar.backend.repository.CategoriaRepository;
import com.grupo_innovar.backend.repository.ProductoRepository;
import com.grupo_innovar.backend.repository.SubcategoriaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class ProductoService {
    
    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id).orElse(null);
    } 

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private SubcategoriaRepository subcategoriaRepository;

    public Producto crear(ProductoDTO dto) {

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Subcategoria subcategoria = subcategoriaRepository.findById(dto.getSubcategoriaId())
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));

        Producto p = new Producto();
        p.setNombre(dto.getNombre());
        p.setDescripcion(dto.getDescripcion());
        p.setPrecioPublico(BigDecimal.valueOf(dto.getPrecioPublico()));
        p.setPrecioMayorista(BigDecimal.valueOf(dto.getPrecioMayorista())); 
        p.setMarca(dto.getMarca());
        p.setStock(dto.getStock());
        p.setReferencia(dto.getReferencia());
        p.setImagenDestacada(dto.getImagenDestacada());
        p.setCategoria(categoria);
        p.setSubcategoria(subcategoria);

        return productoRepository.save(p);
    }

    public Producto actualizar(Long id, ProductoDTO dto) {

        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Subcategoria subcategoria = subcategoriaRepository.findById(dto.getSubcategoriaId())
            .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));

        producto.setReferencia(dto.getReferencia());
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecioPublico(BigDecimal.valueOf(dto.getPrecioPublico()));
        producto.setPrecioMayorista(BigDecimal.valueOf(dto.getPrecioMayorista()));
        producto.setMarca(dto.getMarca());
        producto.setStock(dto.getStock());
        producto.setImagenDestacada(dto.getImagenDestacada());
        producto.setCategoria(categoria);
        producto.setSubcategoria(subcategoria);

        return productoRepository.save(producto);
    }

    public Producto actualizarStock(Long id, int nuevoStock) {

        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setStock(nuevoStock);

        return productoRepository.save(producto);
    } 

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    public Page<Producto> listar(Pageable pageable) {
        return productoRepository.findAll(pageable);
    }
}
