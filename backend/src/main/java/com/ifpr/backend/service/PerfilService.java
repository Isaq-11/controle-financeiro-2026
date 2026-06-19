package com.ifpr.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifpr.backend.repository.PerfilRepository;

@Service
public class PerfilService {
    
    @Autowired
    private PerfilRepository repository;


}
