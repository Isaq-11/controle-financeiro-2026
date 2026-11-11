package com.ifpr.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Gestão Financeira Pessoal e Compartilhada")
                        .description("Documentação interativa OpenAPI / Swagger dos endpoints do sistema financeiro. " +
                                "Permite gerenciar carteiras pessoais e compartilhadas, transações, categorias, relatórios analíticos, " +
                                "notificações em tempo real (SSE) e diagnósticos com Inteligência Artificial (Google Gemini).")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipe de Desenvolvimento IFPR")
                                .email("suporte@financeiro.ifpr.edu.br"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT / Token Bearer")
                                .description("Insira seu token de autenticação gerado no login (ex: token_bearer_1_uuid).")));
    }
}

