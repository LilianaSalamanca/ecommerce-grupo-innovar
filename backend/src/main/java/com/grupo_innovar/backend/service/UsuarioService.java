package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UsuarioService {
    private final UsuarioRepository repo;
    public UsuarioService(UsuarioRepository repo) { this.repo = repo; }

    public Optional<Usuario> findByEmail(String email) { return repo.findByEmail(email); }
    public Usuario save(Usuario u) { return repo.save(u); }
}
