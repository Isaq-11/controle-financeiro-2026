package com.ifpr.backend.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.model.CalcularJuroComposto;
import com.ifpr.backend.model.Soma;
import com.ifpr.backend.service.CalcularJuroCompostoService;
import com.ifpr.backend.service.SomaService;

@RestController
@RequestMapping("/")
public class HelloController {

    @Autowired
    private SomaService somaService;

    @Autowired
    private CalcularJuroCompostoService juroCompostoService;

    @GetMapping()
    public String hello(){
        return "hello Spring";
    }

    @GetMapping("/data-hora")
    public String mostrarHora(){
        return new Date().toString();
    }

    //passar valores na url, mas ela é get. exemplo: localhost:8080?valor1=2&valor2=56
    @PostMapping
    public int somar(@RequestParam("valor1") int valor1, @RequestParam("valor2") int valor2){
        return valor1 + valor2;
    }

    @PostMapping("/classe-somar")
    public Double somarClasse(@RequestBody Soma soma){
        return somaService.somar(soma);
    }

    @PostMapping("/calcular-juro-composto")
    public Double calcularJuroComposto(@RequestBody CalcularJuroComposto juroComposto){
        return juroCompostoService.calcularJuroComposto(juroComposto);
    }
}
