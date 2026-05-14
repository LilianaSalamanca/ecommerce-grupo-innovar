package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.Categoria;
import com.grupo_innovar.backend.model.Subcategoria;
import com.grupo_innovar.backend.repository.CategoriaRepository;
import com.grupo_innovar.backend.repository.SubcategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubcategoriaService {

    private final SubcategoriaRepository subcategoriaRepository;
    private final CategoriaRepository categoriaRepository;

    public SubcategoriaService(
            SubcategoriaRepository subcategoriaRepository,
            CategoriaRepository categoriaRepository
    ) {
        this.subcategoriaRepository = subcategoriaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Subcategoria> listar() {
        return subcategoriaRepository.findAll();
    }

    public List<Subcategoria> listarPorCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaId(categoriaId);
    }

    public Subcategoria guardar(Subcategoria subcategoria) {

        Long categoriaId = subcategoria.getCategoria().getId();

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        subcategoria.setCategoria(categoria);

        return subcategoriaRepository.save(subcategoria);
    }

    public Subcategoria actualizar(Long id, Subcategoria subcategoria) {

        Subcategoria existente = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));

        existente.setNombre(subcategoria.getNombre());

        if (subcategoria.getCategoria() != null) {

            Categoria categoria = categoriaRepository.findById(
                    subcategoria.getCategoria().getId()
            ).orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

            existente.setCategoria(categoria);
        }

        return subcategoriaRepository.save(existente);
    }

    public void eliminar(Long id) {
        subcategoriaRepository.deleteById(id);
    }
}