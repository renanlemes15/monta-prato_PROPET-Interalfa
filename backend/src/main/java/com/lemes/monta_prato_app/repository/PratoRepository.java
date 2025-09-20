package com.lemes.monta_prato_app.repository;
import com.lemes.monta_prato_app.model.Prato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface PratoRepository extends JpaRepository<Prato, Long> {
}
