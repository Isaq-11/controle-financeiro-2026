package com.ifpr.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.service.PerfilService;

@RestController
@RequestMapping("/perfil")
public class PerfilController {
    
    @Autowired
    private PerfilService service;
 

}
