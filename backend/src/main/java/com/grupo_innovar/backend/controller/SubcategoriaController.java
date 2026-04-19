package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.model.Subcategoria;
import com.grupo_innovar.backend.service.SubcategoriaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategorias")
@CrossOrigin(origins = "*")
public class SubcategoriaController {
    
    private final SubcategoriaService subcategoriaService;

    public SubcategoriaController(SubcategoriaService subcategoriaService) {
        this.subcategoriaService = subcategoriaService;
    }

    @GetMapping
    public List<Subcategoria> listar() {
        return subcategoriaService.listarTodas();
    }

    @PostMapping
    public Subcategoria guardar(@RequestBody Subcategoria subcategoria) {
        return subcategoriaService.guardar(subcategoria);
    }
}
