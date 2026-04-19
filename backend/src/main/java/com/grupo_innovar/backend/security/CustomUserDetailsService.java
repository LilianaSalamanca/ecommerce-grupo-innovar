package com.grupo_innovar.backend.security;

import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.UsuarioRepository;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository repo;

    public CustomUserDetailsService(UsuarioRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Usuario u = repo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("No existe usuario: " + email));

        String role = "ROLE_" + u.getRol();

        return User.builder()
                .username(u.getEmail())
                .password(u.getPasswordHash())
                .authorities(role)
                .disabled(!u.isActivo())   // 🔒 aquí bloquea si está desactivado
                .build();
    }
}