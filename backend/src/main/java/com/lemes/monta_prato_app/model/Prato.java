package com.lemes.monta_prato_app.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Getter
@Setter
public class Prato {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private int arroz;
    private int feijao;
    private int salada;
    private int proteina;


}
