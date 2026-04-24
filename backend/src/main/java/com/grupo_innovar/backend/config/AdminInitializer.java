package com.grupo_innovar.backend.config;

import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UsuarioRepository usuarioRepository,
                            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String adminEmail = "admin@grupoinnovar.com";

        if (usuarioRepository.findByEmail(adminEmail).isEmpty()) {

            Usuario admin = new Usuario();
            admin.setNombre("Admin");
            admin.setApellido("Sistema");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("Admin123*"));
            admin.setRol(Usuario.Rol.ADMIN);
            admin.setActivo(true);
            admin.setTipoUsuario(Usuario.TipoUsuario.PUBLICO);

            usuarioRepository.save(admin);

            System.out.println("Usuario ADMIN creado correctamente");
        }
    }
}