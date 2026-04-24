package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.dto.ProductoDTO;
import com.grupo_innovar.backend.model.Producto;
import com.grupo_innovar.backend.service.CloudinaryService;
import com.grupo_innovar.backend.service.ProductoService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "${app.frontend.url}")
@RequestMapping("/api/admin/productos")
public class AdminProductoController {

    private final ProductoService productoService;
    private final CloudinaryService cloudinaryService;

    public AdminProductoController(
            ProductoService productoService,
            CloudinaryService cloudinaryService
    ) {
        this.productoService = productoService;
        this.cloudinaryService = cloudinaryService;
    }

    /* ================= LISTAR ================= */

    @GetMapping
    public Page<Producto> listar(Pageable pageable) {
        return productoService.listar(pageable);
    }

    /* ================= CREAR ================= */

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Producto> crearProducto(
            @RequestParam String nombre,
            @RequestParam String referencia,
            @RequestParam String descripcion,
            @RequestParam Double precioPublico,
            @RequestParam Double precioMayorista,
            @RequestParam String marca,
            @RequestParam Integer stock,
            @RequestParam Long categoriaId,
            @RequestParam Long subcategoriaId,
            @RequestParam("imagen") MultipartFile imagen
    ) throws Exception {

        String imageUrl = cloudinaryService.uploadFile(imagen);

        ProductoDTO dto = new ProductoDTO();
        dto.setNombre(nombre);
        dto.setReferencia(referencia);
        dto.setDescripcion(descripcion);
        dto.setPrecioPublico(precioPublico);
        dto.setPrecioMayorista(precioMayorista);
        dto.setMarca(marca);
        dto.setStock(stock);
        dto.setCategoriaId(categoriaId);
        dto.setSubcategoriaId(subcategoriaId);
        dto.setImagenDestacada(imageUrl);

        Producto producto = productoService.crear(dto);

        return ResponseEntity.ok(producto);
    }

    /* ================= ACTUALIZAR ================= */

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id,
            @RequestParam String nombre,
            @RequestParam String referencia,
            @RequestParam String descripcion,
            @RequestParam Double precioPublico,
            @RequestParam Double precioMayorista,
            @RequestParam String marca,
            @RequestParam Integer stock,
            @RequestParam Long categoriaId,
            @RequestParam Long subcategoriaId,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen
    ) throws Exception {

        Producto productoExistente = productoService.buscarPorId(id);

        if (productoExistente == null) {
            return ResponseEntity.notFound().build();
        }

        String imageUrl = productoExistente.getImagenDestacada();

        // Solo sube imagen si viene nueva
        if (imagen != null && !imagen.isEmpty()) {
            imageUrl = cloudinaryService.uploadFile(imagen);
        }

        ProductoDTO dto = new ProductoDTO();
        dto.setNombre(nombre);
        dto.setReferencia(referencia);
        dto.setDescripcion(descripcion);
        dto.setPrecioPublico(precioPublico);
        dto.setPrecioMayorista(precioMayorista);
        dto.setMarca(marca);
        dto.setStock(stock);
        dto.setCategoriaId(categoriaId);
        dto.setSubcategoriaId(subcategoriaId);
        dto.setImagenDestacada(imageUrl);

        Producto actualizado = productoService.actualizar(id, dto);

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