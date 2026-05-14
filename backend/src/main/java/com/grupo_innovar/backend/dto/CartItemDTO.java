package com.grupo_innovar.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemDTO {

    private Long productoId;
    private Integer cantidad;
}