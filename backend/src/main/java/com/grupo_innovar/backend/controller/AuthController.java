package com.grupo_innovar.backend.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import com.grupo_innovar.backend.dto.GoogleRequest;
import com.grupo_innovar.backend.dto.LoginRequest;
import com.grupo_innovar.backend.dto.LoginResponse;
import com.grupo_innovar.backend.dto.RegisterRequest;

import com.grupo_innovar.backend.model.Usuario;

import com.grupo_innovar.backend.repository.UsuarioRepository;

import com.grupo_innovar.backend.security.JwtTokenProvider;

import com.grupo_innovar.backend.service.PasswordResetService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.Authentication;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;

    private final UsuarioRepository repo;

    private final JwtTokenProvider jwt;

    private final PasswordEncoder encoder;

    private final PasswordResetService resetService;

    public AuthController(
            AuthenticationManager authManager,
            UsuarioRepository repo,
            JwtTokenProvider jwt,
            PasswordEncoder encoder,
            PasswordResetService resetService
    ) {

        this.authManager = authManager;
        this.repo = repo;
        this.jwt = jwt;
        this.encoder = encoder;
        this.resetService = resetService;
    }

    // =====================================================
    // REGISTRO
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest r
    ) {

        if (repo.existsByEmail(r.email())) {

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Email ya registrado"
                            )
                    );
        }

        Usuario u = new Usuario();

        u.setNombre(r.nombre());
        u.setApellido(r.apellido());

        u.setEmail(r.email());

        u.setPasswordHash(
                encoder.encode(r.password())
        );

        u.setActivo(true);

        u.setInvitado(false);

        u.setTipoUsuario(
                Usuario.TipoUsuario.PUBLICO
        );

        u.setRol(
                Usuario.Rol.USUARIO
        );

        u.setUltimoLogin(
                LocalDateTime.now()
        );

        repo.save(u);

        Authentication authentication =
                authManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                r.email(),
                                r.password()
                        )
                );

        String token =
                jwt.generateToken(authentication);

        return ResponseEntity.ok(
                new LoginResponse(
                        token,
                        u.getEmail(),
                        u.getNombre()
                )
        );
    }

    // =====================================================
    // LOGIN NORMAL
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest r
    ) {

        try {

            Authentication authentication =
                    authManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    r.email(),
                                    r.password()
                            )
                    );

            Usuario usuario =
                    repo.findByEmail(r.email())
                            .orElseThrow();

            usuario.setUltimoLogin(
                    LocalDateTime.now()
            );

            repo.save(usuario);

            String token =
                    jwt.generateToken(authentication);

            return ResponseEntity.ok(
                    new LoginResponse(
                            token,
                            usuario.getEmail(),
                            usuario.getNombre()
                    )
            );

        } catch (DisabledException e) {

            return ResponseEntity.status(403)
                    .body(
                            Map.of(
                                    "message",
                                    "Cuenta desactivada. Contacte al administrador."
                            )
                    );

        } catch (BadCredentialsException e) {

            return ResponseEntity.status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Email o contraseña incorrectos"
                            )
                    );
        }
    }

    // =====================================================
    // LOGIN GOOGLE
    // =====================================================

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> loginWithGoogle(
            @RequestBody GoogleRequest request
    ) throws Exception {

        FirebaseToken decoded =
                FirebaseAuth.getInstance()
                        .verifyIdToken(
                                request.idToken()
                        );

        String email =
                decoded.getEmail();

        String nombre =
                decoded.getName();

        Usuario usuario =
                repo.findByEmail(email)
                        .orElse(null);

        if (usuario == null) {

            usuario = new Usuario();

            usuario.setEmail(email);

            usuario.setNombre(
                    nombre != null
                            ? nombre
                            : "Usuario Google"
            );

            usuario.setApellido("");

            usuario.setPasswordHash("");

            usuario.setActivo(true);

            usuario.setInvitado(false);

            usuario.setTipoUsuario(
                    Usuario.TipoUsuario.PUBLICO
            );

            usuario.setRol(
                    Usuario.Rol.USUARIO
            );

            usuario.setUltimoLogin(
                    LocalDateTime.now()
            );

            repo.save(usuario);
        }

        if (!usuario.isActivo()) {

            throw new RuntimeException(
                    "Cuenta desactivada. Contacte al administrador."
            );
        }

        usuario.setUltimoLogin(
                LocalDateTime.now()
        );

        repo.save(usuario);

        String role =
                "ROLE_" + usuario.getRol();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(role)
                        )
                );

        String token =
                jwt.generateToken(authentication);

        return ResponseEntity.ok(
                new LoginResponse(
                        token,
                        email,
                        usuario.getNombre()
                )
        );
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> body
    ) {

        try {

            System.out.println(body);

            String email =
                    body.get("email");

            resetService.processForgotPassword(
                    email
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Si el email existe, recibirás instrucciones"
                )
        );
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> body
    ) {

        try {

            String token =
                    body.get("token");

            String newPassword =
                    body.get("password");

            resetService.resetPassword(
                    token,
                    newPassword
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Contraseña actualizada"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}