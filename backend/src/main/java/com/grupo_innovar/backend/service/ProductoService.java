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
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    public List<Producto> obtenerRelacionados(Long productoId) {

        Producto base = productoRepository.findById(productoId)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        List<Producto> resultado = new ArrayList<>();

        List<Producto> sub = productoRepository.relacionadosMismaSubcategoria(
            productoId,
            base.getSubcategoria().getId(),
            PageRequest.of(0, 10)
        );

        List<Producto> cat = productoRepository.relacionadosMismaCategoria(
            productoId,
            base.getCategoria().getId(),
            PageRequest.of(0, 10)
        );

        List<Producto> marca = productoRepository.relacionadosMismaMarca(
            productoId,
            base.getMarca(),
            PageRequest.of(0, 10)
        );

        // Mezcla
        Collections.shuffle(sub);
        Collections.shuffle(cat);
        Collections.shuffle(marca);

        // Agregar con prioridad
        agregar(resultado, sub);
        agregar(resultado, cat);
        agregar(resultado, marca);

        // RELLENO: si no hay suficientes
        if (resultado.size() < 5) {
            List<Producto> random = productoRepository.findAll(PageRequest.of(0, 20)).getContent();
            Collections.shuffle(random);
            agregar(resultado, random);
        }

        // Garantizar EXACTAMENTE 5
        return resultado.stream().limit(5).toList();
    }

    private void agregar(List<Producto> resultado, List<Producto> fuente) {

        for (Producto p : fuente) {

            if (resultado.size() >= 5) break;

            boolean yaExiste = resultado.stream()
                .anyMatch(r -> r.getId().equals(p.getId()));

            if (!yaExiste) {
                resultado.add(p);
            }
        }
    }
}
