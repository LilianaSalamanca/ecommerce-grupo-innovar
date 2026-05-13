package com.grupo_innovar.backend.repository;

import com.grupo_innovar.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;  

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByReferencia(String referencia);
    List<Producto> findBySubcategoriaId(Long subcategoriaId);
    List<Producto> findByCategoriaId(Long categoriaId);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    int countByStock(int stock);

    @Query("""
    SELECT p FROM Producto p
    WHERE p.id <> :productoId
    AND p.subcategoria.id = :subcategoriaId
    ORDER BY p.stock DESC, p.precioPublico ASC
    """)
    List<Producto> relacionadosMismaSubcategoria(Long productoId, Long subcategoriaId, Pageable pageable);

    @Query("""
    SELECT p FROM Producto p
    WHERE p.id <> :productoId
    AND p.categoria.id = :categoriaId
    ORDER BY p.stock DESC, p.precioPublico ASC
    """)
    List<Producto> relacionadosMismaCategoria(Long productoId, Long categoriaId, Pageable pageable);

    @Query("""
    SELECT p FROM Producto p
    WHERE p.id <> :productoId
    AND LOWER(p.marca) = LOWER(:marca)
    ORDER BY p.stock DESC, p.precioPublico ASC
    """)
    List<Producto> relacionadosMismaMarca(Long productoId, String marca, Pageable pageable);

}