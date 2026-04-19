package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.model.Producto;
import com.grupo_innovar.backend.service.ProductoService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "${app.frontend.url}")
@RequestMapping("/api/admin/productos")
public class AdminProductoController {

    private final ProductoService productoService;

    public AdminProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    /* ================= LISTAR ================= */

    @GetMapping
    public Page<Producto> listar(Pageable pageable) {
        return productoService.listar(pageable);
    }

    /* ================= CREAR ================= */

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoService.guardar(producto);
    }

    /* ================= ACTUALIZAR ================= */

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(
            @PathVariable Long id,
            @RequestBody Producto productoActualizado) {

        Producto producto = productoService.buscarPorId(id);

        if (producto == null) {
            return ResponseEntity.notFound().build();
        }

        producto.setReferencia(productoActualizado.getReferencia());
        producto.setNombre(productoActualizado.getNombre());
        producto.setDescripcion(productoActualizado.getDescripcion());
        producto.setPrecioPublico(productoActualizado.getPrecioPublico());
        producto.setPrecioMayorista(productoActualizado.getPrecioMayorista());
        producto.setMarca(productoActualizado.getMarca());
        producto.setStock(productoActualizado.getStock());
        producto.setImagenDestacada(productoActualizado.getImagenDestacada());
        producto.setCategoria(productoActualizado.getCategoria());
        producto.setSubcategoria(productoActualizado.getSubcategoria());

        Producto actualizado = productoService.guardar(producto);

        return ResponseEntity.ok(actualizado);
    }

    /* ================= ELIMINAR ================= */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        Producto producto = productoService.buscarPorId(id);

        if (producto == null) {
            return ResponseEntity.notFound().build();
        }

        productoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}