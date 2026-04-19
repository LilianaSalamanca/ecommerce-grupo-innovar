package com.grupo_innovar.backend.controller;
 
import com.grupo_innovar.backend.model.Producto;
import com.grupo_innovar.backend.repository.ProductoRepository;
import com.grupo_innovar.backend.service.ProductoService;
import com.grupo_innovar.backend.dto.ProductoDTO;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; 
import jakarta.validation.Valid;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    
    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public List<Producto> buscar(@RequestParam String q) {
        return productoRepository.findByNombreContainingIgnoreCase(q);
    }

    @GetMapping("/categoria/{id}")
    public List<Producto> porCategoria(@PathVariable Long id) {
        return productoRepository.findByCategoriaId(id);
    }

    @GetMapping("/subcategoria/{id}")
    public List<Producto> porSubcategoria(@PathVariable Long id) {
        return productoRepository.findBySubcategoriaId(id);
    } 

    @Autowired
    private ProductoService productoService;

    /**
     * Crea un nuevo producto
     * POST /api/productos
     */
    @PostMapping
    public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoDTO productoDTO) {
        Producto nuevoProducto = productoService.crear(productoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }
 
    /**
     * Actualiza un producto existente
     * PUT /api/productos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProductoDTO productoDTO) {
        Producto productoActualizado = productoService.actualizar(id, productoDTO);
        return ResponseEntity.ok(productoActualizado);
    }
 
    /**
     * Elimina un producto
     * DELETE /api/productos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
 
    /**
     * Actualiza el stock de un producto
     * PATCH /api/productos/{id}/stock
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Producto> actualizarStock(
            @PathVariable Long id,
            @RequestBody StockUpdateRequest request) {
        Producto productoActualizado = productoService.actualizarStock(id, request.getStock());
        return ResponseEntity.ok(productoActualizado);
    } 
 
    /**
     * Clase interna para actualizar stock
     */
    static class StockUpdateRequest {
        private int stock;

        public int getStock() {
            return stock;
        }

        public void setStock(int stock) {
            this.stock = stock;
        }
    }
}
