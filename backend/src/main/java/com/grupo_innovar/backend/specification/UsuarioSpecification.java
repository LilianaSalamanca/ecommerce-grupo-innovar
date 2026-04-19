package com.grupo_innovar.backend.specification;

import com.grupo_innovar.backend.model.Usuario;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class UsuarioSpecification {

    public static Specification<Usuario> conFiltros(
            Boolean activo,
            String rol,
            String email
    ) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (activo != null) {
                predicates.add(
                        cb.equal(root.get("activo"), activo)
                );
            }

            if (rol != null && !rol.isEmpty()) {
                predicates.add(
                        cb.equal(root.get("rol"), rol)
                );
            }

            if (email != null && !email.isEmpty()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("email")),
                                "%" + email.toLowerCase() + "%"
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}