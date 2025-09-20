package com.lemes.monta_prato_app.service;
import com.lemes.monta_prato_app.model.Prato;
import com.lemes.monta_prato_app.repository.PratoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PratoService {
    private final PratoRepository pratoRepository;

    public PratoService(PratoRepository pratoRepository) {
        this.pratoRepository = pratoRepository;
    }

    public List<Prato> listarTodos() {
        return pratoRepository.findAll();
    }

    public Prato salvar(Prato prato) {
        return pratoRepository.save(prato);
    }
    @Transactional
    public void deletarTodosPratos() {
        pratoRepository.deleteAll();
    }

    public void deletar(Long id) {
        pratoRepository.deleteById(id);
    }
}
