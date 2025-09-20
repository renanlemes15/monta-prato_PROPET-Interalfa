package com.lemes.monta_prato_app.controller;

import com.lemes.monta_prato_app.model.Prato;
import com.lemes.monta_prato_app.service.PratoService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "http://localhost:3000")
public class PratoController {

    private final PratoService pratoService;

    public PratoController(PratoService pratoService) {
        this.pratoService = pratoService;
    }

    @PostMapping
    public Prato salvar(@RequestBody Prato prato) {
        return pratoService.salvar(prato);
    }

    @GetMapping
    public List<Prato> listarTodos() {
        return pratoService.listarTodos();
    }

    @DeleteMapping
    public void deletarTodos() {
        pratoService.deletarTodosPratos();
    }

    @GetMapping("/estatisticas")
    public Map<String, Double> somarEstatisticas(){
        List<Prato> pratos = pratoService.listarTodos();

        double totalArroz = pratos.stream().mapToDouble(Prato::getArroz).sum();
        double totalFeijao = pratos.stream().mapToDouble(Prato::getFeijao).sum();
        double totalSalada = pratos.stream().mapToDouble(Prato::getSalada).sum();
        double totalProteina = pratos.stream().mapToDouble(Prato::getProteina).sum();

        int totalPratos = pratos.size();

        Map<String, Double> estatisticas = new HashMap<>();
        estatisticas.put("totalArroz", totalArroz / totalPratos);
        estatisticas.put("totalFeijao", totalFeijao / totalPratos);
        estatisticas.put("totalSalada", totalSalada / totalPratos);
        estatisticas.put("totalProteina", totalProteina / totalPratos);

        return estatisticas;

    }
}
