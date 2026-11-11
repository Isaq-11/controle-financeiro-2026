package com.ifpr.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ifpr.backend.dto.LoginResponseDTO;
import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TokenRedefinicaoSenhaRepository;
import com.ifpr.backend.repository.TransacaoRepository;
import com.ifpr.backend.repository.UsuarioRepository;
import com.ifpr.backend.service.AuthService;
import com.ifpr.backend.service.CarteiraService;
import com.ifpr.backend.service.CategoriaService;
import com.ifpr.backend.service.EmailService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TokenRedefinicaoSenhaRepository tokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private CategoriaService categoriaService;

    @Mock
    private CarteiraService carteiraService;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private TransacaoRepository transacaoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private Usuario usuarioMock;

    @BeforeEach
    void setUp() {
        usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setName("Carlos Silva");
        usuarioMock.setEmail("carlos@teste.com");
        usuarioMock.setPassword("hash_bcrypt_123");
    }

    @Test
    @DisplayName("Deve cadastrar novo usuário com senha criptografada em BCrypt e carteira inicial")
    void deveCadastrarUsuarioComSucesso() {
        Usuario novoUsuario = new Usuario();
        novoUsuario.setName("Carlos Silva");
        novoUsuario.setEmail("carlos@teste.com");
        novoUsuario.setPassword("senha123");

        when(usuarioRepository.existsByEmail("carlos@teste.com")).thenReturn(false);
        when(passwordEncoder.encode("senha123")).thenReturn("hash_bcrypt_123");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioMock);

        Carteira carteiraMock = new Carteira();
        carteiraMock.setId(10L);
        carteiraMock.setNome("Carteira de Carlos Silva");
        when(carteiraService.criarCarteira(any(Carteira.class), eq(usuarioMock))).thenReturn(carteiraMock);

        Categoria categoriaSalario = new Categoria();
        categoriaSalario.setId(5L);
        categoriaSalario.setNome("Salário");
        categoriaSalario.setTipo(TipoTransacao.RECEITA);
        when(categoriaRepository.findByUsuarioIdAndTipo(1L, TipoTransacao.RECEITA))
                .thenReturn(List.of(categoriaSalario));

        Usuario resultado = authService.cadastrar(novoUsuario);

        assertNotNull(resultado);
        assertEquals("carlos@teste.com", resultado.getEmail());
        verify(passwordEncoder).encode("senha123");
        verify(categoriaService).criarCategoriasPadrao(usuarioMock);
        verify(carteiraService).criarCarteira(any(Carteira.class), eq(usuarioMock));
        verify(transacaoRepository).save(any(Transacao.class));
    }

    @Test
    @DisplayName("Deve rejeitar cadastro com e-mail duplicado lançando BusinessException")
    void deveRejeitarCadastroEmailDuplicado() {
        Usuario usuarioDuplicado = new Usuario();
        usuarioDuplicado.setEmail("carlos@teste.com");

        when(usuarioRepository.existsByEmail("carlos@teste.com")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            authService.cadastrar(usuarioDuplicado);
        });

        assertEquals("Este e-mail já está cadastrado!", ex.getMessage());
    }

    @Test
    @DisplayName("Deve autenticar login com sucesso quando senha for válida")
    void deveRealizarLoginComSucesso() {
        when(usuarioRepository.findByEmail("carlos@teste.com")).thenReturn(Optional.of(usuarioMock));
        when(passwordEncoder.matches("senha123", "hash_bcrypt_123")).thenReturn(true);

        LoginResponseDTO resposta = authService.login("carlos@teste.com", "senha123");

        assertNotNull(resposta);
        assertNotNull(resposta.getAccessToken());
        assertEquals("Carlos Silva", resposta.getUsuario().getName());
        assertEquals("carlos@teste.com", resposta.getUsuario().getEmail());
    }

    @Test
    @DisplayName("Deve falhar no login quando a senha estiver incorreta")
    void deveFalharLoginSenhaIncorreta() {
        when(usuarioRepository.findByEmail("carlos@teste.com")).thenReturn(Optional.of(usuarioMock));
        when(passwordEncoder.matches("senha_errada", "hash_bcrypt_123")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            authService.login("carlos@teste.com", "senha_errada");
        });

        assertEquals("Credenciais inválidas! Senha incorreta.", ex.getMessage());
    }
}

