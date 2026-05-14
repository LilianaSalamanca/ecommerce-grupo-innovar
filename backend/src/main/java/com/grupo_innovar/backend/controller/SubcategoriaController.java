package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.model.Subcategoria;
import com.grupo_innovar.backend.service.SubcategoriaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategorias")
@CrossOrigin
public class SubcategoriaController {

    private final SubcategoriaService subcategoriaService;

    public SubcategoriaController(SubcategoriaService subcategoriaService) {
        this.subcategoriaService = subcategoriaService;
    }

    @GetMapping
    public List<Subcategoria> listar() {
        return subcategoriaService.listar();
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<Subcategoria> listarPorCategoria(
            @PathVariable Long categoriaId
    ) {
        return subcategoriaService.listarPorCategoria(categoriaId);
    }

    @PostMapping
    public Subcategoria guardar(@RequestBody Subcategoria subcategoria) {
        return subcategoriaService.guardar(subcategoria);
    }

    @PutMapping("/{id}")
    public Subcategoria actualizar(
            @PathVariable Long id,
            @RequestBody Subcategoria subcategoria
    ) {
        return subcategoriaService.actualizar(id, subcategoria);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        subcategoriaService.eliminar(id);
    }
}