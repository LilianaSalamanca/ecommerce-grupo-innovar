package com.grupo_innovar.backend.specification;

import com.grupo_innovar.backend.model.Pedido;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class PedidoSpecification {

    public static Specification<Pedido> conFiltros(
            String email,
            String estado,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin
    ) {
        return (root, query, cb) -> {

            var predicates = cb.conjunction();

            if (email != null && !email.isBlank()) {

                var emailPredicateCliente =
                        cb.like(cb.lower(root.get("emailCliente")), "%" + email.toLowerCase() + "%");

                var usuarioJoin = root.join("usuario", jakarta.persistence.criteria.JoinType.LEFT);

                var emailPredicateUsuario =
                        cb.like(cb.lower(usuarioJoin.get("email")), "%" + email.toLowerCase() + "%");

                predicates = cb.and(predicates,
                        cb.or(emailPredicateCliente, emailPredicateUsuario));
            }

            if (estado != null && !estado.isBlank()) {
                predicates = cb.and(predicates,
                        cb.equal(root.get("estadoPedido"), estado));
            }

            if (fechaInicio != null) {
                predicates = cb.and(predicates,
                        cb.greaterThanOrEqualTo(root.get("fechaCreacion"), fechaInicio));
            }

            return predicates;
        };
    }
}