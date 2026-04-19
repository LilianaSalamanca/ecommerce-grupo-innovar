package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository repo;

    public Usuario loginOrRegister(String email, String nombre) {
        return repo.findByEmail(email)
                .orElseGet(() -> {
                    Usuario nuevo = new Usuario();
                    nuevo.setEmail(email);
                    nuevo.setNombre(nombre);
                    nuevo.setApellido("");
                    nuevo.setPasswordHash("GOOGLE_USER");
                    return repo.save(nuevo);
                });
    }
}
