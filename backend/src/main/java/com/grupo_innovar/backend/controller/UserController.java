package com.grupo_innovar.backend.controller;

import java.security.Principal;
import java.util.Map;

import com.grupo_innovar.backend.dto.ChangePasswordRequest;
import com.grupo_innovar.backend.dto.UsuarioProfileDTO;
import com.grupo_innovar.backend.model.Usuario;
import com.grupo_innovar.backend.repository.UsuarioRepository;
import com.grupo_innovar.backend.service.UsuarioService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UserController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService userService;
    private final PasswordEncoder encoder;

    /* ================= PERFIL ================= */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "No autenticado"));
        }

        String email = auth.getPrincipal() instanceof UserDetails userDetails
                ? userDetails.getUsername()
                : auth.getName();

        var usuarioOpt = userService.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Usuario no encontrado"));
        }

        Usuario u = usuarioOpt.get();

        UsuarioProfileDTO dto = new UsuarioProfileDTO(
                u.getNombre(),
                u.getApellido(),
                u.getEmail(),
                u.getTelefono(),
                u.getDireccion(),
                u.getCiudad(),
                u.getDepartamento(),
                u.isActivo()
        );

        return ResponseEntity.ok(dto);
    }

    /* ================= ACTUALIZAR PERFIL ================= */
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Usuario updatedData, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No autenticado"));

        Usuario user = usuarioRepository.findByEmail(principal.getName())
                .orElse(null);

        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Usuario no encontrado"));

        // Validaciones básicas
        if (updatedData.getNombre() == null || updatedData.getNombre().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Nombre requerido"));
        if (updatedData.getApellido() == null || updatedData.getApellido().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Apellido requerido"));

        // Solo campos permitidos
        user.setNombre(updatedData.getNombre());
        user.setApellido(updatedData.getApellido());
        user.setTelefono(updatedData.getTelefono());
        user.setCiudad(updatedData.getCiudad());
        user.setDepartamento(updatedData.getDepartamento());
        user.setDireccion(updatedData.getDireccion());

        usuarioRepository.save(user);
        return ResponseEntity.ok(new UsuarioProfileDTO(
                user.getNombre(),
                user.getApellido(),
                user.getEmail(),
                user.getTelefono(),
                user.getDireccion(),
                user.getCiudad(),
                user.getDepartamento(),
                user.isActivo()
        ));
    }

    /* ================= CAMBIAR CONTRASEÑA ================= */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No autenticado"));

        Usuario user = usuarioRepository.findByEmail(principal.getName())
                .orElse(null);

        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Usuario no encontrado"));

        if (req.currentPassword() == null || req.newPassword() == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Campos requeridos"));

        if (!encoder.matches(req.currentPassword(), user.getPasswordHash()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Contraseña actual incorrecta"));

        user.setPasswordHash(encoder.encode(req.newPassword()));
        usuarioRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada"));
    }
}