package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.dto.ProductoDTO;
import com.grupo_innovar.backend.model.Producto;
import com.grupo_innovar.backend.service.FirebaseStorageService;
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
    private final FirebaseStorageService firebaseStorageService;

    // Inyección correcta de dependencias
    public AdminProductoController(
            ProductoService productoService,
            FirebaseStorageService firebaseStorageService
    ) {
        this.productoService = productoService;
        this.firebaseStorageService = firebaseStorageService;
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

        // Validación mínima
        if (imagen == null || imagen.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Subir imagen a Firebase
        String imageUrl = firebaseStorageService.uploadFile(imagen);

        // Mapear a DTO
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

        // Guardar en DB
        Producto producto = productoService.crear(dto);

        return ResponseEntity.ok(producto);
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

        // Solo actualiza imagen si viene nueva URL
        if (productoActualizado.getImagenDestacada() != null) {
            producto.setImagenDestacada(productoActualizado.getImagenDestacada());
        }

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