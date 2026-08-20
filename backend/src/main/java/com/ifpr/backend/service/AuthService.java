package com.ifpr.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import com.ifpr.backend.dto.ForgotPasswordResponseDTO;
import com.ifpr.backend.dto.LoginResponseDTO;
import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.TokenRedefinicaoSenha;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.TokenRedefinicaoSenhaRepository;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenRedefinicaoSenhaRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private CarteiraService carteiraService;

    @Autowired
    private com.ifpr.backend.repository.CategoriaRepository categoriaRepository;

    @Autowired
    private com.ifpr.backend.repository.TransacaoRepository transacaoRepository;

    // Cadastro de usuário
    public Usuario cadastrar(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new BusinessException("Este e-mail já está cadastrado!");
        }

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        // Criar categorias padrão para o novo usuário
        categoriaService.criarCategoriasPadrao(usuarioSalvo);

        // Criar carteira padrão para o novo usuário
        Carteira carteiraPadrao = new Carteira();
        carteiraPadrao.setNome("Minha Carteira Principal");
        carteiraPadrao.setDescricao("Carteira criada automaticamente no cadastro.");
        Carteira carteiraSalva = carteiraService.criarCarteira(carteiraPadrao, usuarioSalvo);

        // Adicionar o saldo inicial de R$ 2.500,00 de acordo com as regras do sistema
        var categorias = categoriaRepository.findByUsuarioIdAndTipo(usuarioSalvo.getId(), com.ifpr.backend.model.TipoTransacao.RECEITA);
        com.ifpr.backend.model.Categoria catSalario = categorias.stream()
                .filter(c -> "Salário".equalsIgnoreCase(c.getNome()))
                .findFirst()
                .orElse(categorias.isEmpty() ? null : categorias.get(0));

        com.ifpr.backend.model.Transacao transacaoInicial = new com.ifpr.backend.model.Transacao();
        transacaoInicial.setCarteira(carteiraSalva);
        transacaoInicial.setCriadoPor(usuarioSalvo);
        transacaoInicial.setCategoria(catSalario);
        transacaoInicial.setTipo(com.ifpr.backend.model.TipoTransacao.RECEITA);
        transacaoInicial.setValor(new java.math.BigDecimal("2500.00"));
        transacaoInicial.setDescricao("Saldo Inicial da Carteira");
        transacaoInicial.setData(java.time.LocalDate.now());
        transacaoRepository.save(transacaoInicial);

        // Enviar e-mail de confirmação de cadastro usando o template Thymeleaf
        try {
            Context context = new Context();
            context.setVariable("nome", usuarioSalvo.getName());
            emailService.enviarEmailTemplate(usuarioSalvo.getEmail(), "Bem-vindo ao Controle Financeiro!", "novoCadastro", context);
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail de cadastro: " + e.getMessage());
        }

        return usuarioSalvo;
    }

    // Autenticação / Login
    public LoginResponseDTO login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Credenciais inválidas! E-mail não encontrado."));

        if (!usuario.getPassword().equals(password)) {
            throw new BusinessException("Credenciais inválidas! Senha incorreta.");
        }

        // Gerando um token de acesso para a sessão (formato legível e funcional)
        String tokenAcesso = "token_bearer_" + usuario.getId() + "_" + UUID.randomUUID().toString();
        return new LoginResponseDTO(tokenAcesso, usuario);
    }

    // Solicitação de Recuperação de Senha (Esqueci a senha)
    public ForgotPasswordResponseDTO solicitarRecuperacaoSenha(String email) {
        String mensagemNeutra = "Se este e-mail estiver cadastrado, você receberá as instruções em breve.";
        
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            // Retorna mensagem neutra por segurança (PDF 2, seção 4.1 / 5.1)
            return new ForgotPasswordResponseDTO(mensagemNeutra, "e-mail-nao-encontrado");
        }

        // Criar token único com expiração de 1 hora
        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        TokenRedefinicaoSenha tokenEntidade = new TokenRedefinicaoSenha();
        tokenEntidade.setUsuario(usuario);
        tokenEntidade.setToken(token);
        tokenEntidade.setExpiraEm(LocalDateTime.now().plusHours(1));
        tokenEntidade.setUtilizado(false);

        tokenRepository.save(tokenEntidade);

        // Enviar e-mail com o token de redefinição
        try {
            Context context = new Context();
            context.setVariable("nome", usuario.getName());
            context.setVariable("token", token);
            emailService.enviarEmailTemplate(usuario.getEmail(), "Recuperação de Senha - Controle Financeiro", "recuperacaoSenha", context);
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail de recuperação: " + e.getMessage());
        }

        return new ForgotPasswordResponseDTO(mensagemNeutra, token);
    }

    // Redefinição de Senha com Token
    public void redefinirSenha(String token, String newPassword) {
        TokenRedefinicaoSenha tokenEntidade = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token inválido ou inexistente."));

        if (tokenEntidade.isUtilizado()) {
            throw new BusinessException("Este token já foi utilizado para redefinir a senha.");
        }

        if (tokenEntidade.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Este token expirou. Solicite um novo código de recuperação.");
        }

        Usuario usuario = tokenEntidade.getUsuario();
        usuario.setPassword(newPassword);
        usuarioRepository.save(usuario);

        tokenEntidade.setUtilizado(true);
        tokenRepository.save(tokenEntidade);
    }

    // Alteração de Senha (Área Autenticada)
    public void alterarSenha(Usuario usuario, String currentPassword, String newPassword) {
        if (!usuario.getPassword().equals(currentPassword)) {
            throw new BusinessException("A senha atual digitada está incorreta!");
        }

        usuario.setPassword(newPassword);
        usuarioRepository.save(usuario);
    }
}
