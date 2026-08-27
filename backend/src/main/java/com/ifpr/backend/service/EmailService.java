package com.ifpr.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username:}")
    private String remetentePadrao;

    @Value("${spring.mail.password:}")
    private String senhaEmail;

    public void enviarEmail(String destinatario, String assunto, String texto){
        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            if (remetentePadrao != null && !remetentePadrao.isBlank()) {
                mensagem.setFrom(remetentePadrao);
            }
            mensagem.setTo(destinatario);
            mensagem.setSubject(assunto);
            mensagem.setText(texto);

            javaMailSender.send(mensagem);
            System.out.println(">>> [E-MAIL OK] Mensagem enviada com sucesso para: " + destinatario);
        } catch (Exception e) {
            System.err.println(">>> [E-MAIL ERRO] Falha no envio para " + destinatario + ": " + e.getMessage());
        }
    }

    @Async
    public void enviarEmailTemplate(String destinatario, String assunto, String template, Context contexto){
        String codigoToken = contexto.getVariable("token") != null ? contexto.getVariable("token").toString() : "";

        if (senhaEmail == null || senhaEmail.trim().isEmpty()) {
            System.out.println("\n=========================================================================");
            System.out.println(">>> [AVISO DE CONFIGURAÇÃO DE E-MAIL SMTP]");
            System.out.println(">>> Destinatário: " + destinatario);
            System.out.println(">>> Código de 6 dígitos gerado: " + codigoToken);
            System.out.println(">>> Para entregar o e-mail REAL na caixa de entrada via Gmail,");
            System.out.println(">>> preencha a Senha de App do Google (16 caracteres) em application.properties:");
            System.out.println(">>> spring.mail.password=sua_senha_de_app_aqui");
            System.out.println("=========================================================================\n");
        }

        try {
            String templateString = templateEngine.process(template, contexto);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            if (remetentePadrao != null && !remetentePadrao.isBlank()) {
                helper.setFrom(remetentePadrao);
            }
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(templateString, true);

            javaMailSender.send(message);
            System.out.println(">>> [E-MAIL REAL ENVIADO VIA SMTP GMAIL] Sucesso para: " + destinatario + " (Código: " + codigoToken + ")");
        } catch (Exception e) {
            System.err.println("\n>>> [E-MAIL ERRO SMTP] O Gmail rejeitou o envio porque a 'spring.mail.password' está vazia ou incorreta.");
            System.err.println(">>> Erro original: " + e.getMessage());
            System.err.println(">>> [CÓDIGO DE VERIFICAÇÃO EM CASCATA]: " + codigoToken + "\n");
        }
    }
}
