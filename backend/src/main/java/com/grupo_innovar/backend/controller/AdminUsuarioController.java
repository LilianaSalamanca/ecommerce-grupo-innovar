package com.grupo_innovar.backend.controller;

import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.UsuarioRepository;
import com.grupo_innovar.backend.specification.UsuarioSpecification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

@RestController
@RequestMapping("/api/admin/usuarios")
@CrossOrigin(origins = "${app.frontend.url}")
public class AdminUsuarioController {

    private final UsuarioRepository usuarioRepository;

    public AdminUsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Crear usuario
    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        if(usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El correo ya existe.");
        }
        return usuarioRepository.save(usuario);
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody Usuario datos) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(datos.getNombre());
        usuario.setApellido(datos.getApellido());
        usuario.setEmail(datos.getEmail());
        usuario.setTelefono(datos.getTelefono());
        usuario.setRol(datos.getRol());
        usuario.setActivo(datos.isActivo());

        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {

        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setActivo(false); // Soft delete
                    usuarioRepository.save(usuario);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Cambiar estado activo/inactivo
   @PatchMapping("/{id}/estado")
    public ResponseEntity<Usuario> cambiarEstado(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(user -> {
                    user.setActivo(!user.isActivo()); // alterna el estado
                    usuarioRepository.save(user);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Page<Usuario>> listarUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String email
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("id").descending()
        );

        Specification<Usuario> spec =
                UsuarioSpecification.conFiltros(activo, rol, email);

        Page<Usuario> usuarios =
                usuarioRepository.findAll(spec, pageable);

        return ResponseEntity.ok(usuarios);
    }

}