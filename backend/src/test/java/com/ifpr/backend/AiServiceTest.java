package com.ifpr.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.ifpr.backend.dto.AiInsightDTO;
import com.ifpr.backend.dto.RelatorioFinanceiroDTO;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.AiService;
import com.ifpr.backend.service.CarteiraService;
import com.ifpr.backend.service.TransacaoService;

@ExtendWith(MockitoExtension.class)
class AiServiceTest {

    @Mock
    private TransacaoService transacaoService;

    @Mock
    private CarteiraService carteiraService;

    @InjectMocks
    private AiService aiService;

    private Usuario usuarioMock;

    @BeforeEach
    void setUp() {
        usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setName("Lucas Lima");
        usuarioMock.setEmail("lucas@teste.com");
    }

    @Test
    @DisplayName("Deve identificar quando chave de API não está configurada")
    void deveIdentificarChaveNaoConfigurada() {
        ReflectionTestUtils.setField(aiService, "apiKey", "");
        assertFalse(aiService.isConfigurado());

        ReflectionTestUtils.setField(aiService, "apiKey", "sua_chave_aqui");
        assertFalse(aiService.isConfigurado());

        ReflectionTestUtils.setField(aiService, "apiKey", null);
        assertFalse(aiService.isConfigurado());
    }

    @Test
    @DisplayName("Deve identificar chave de API válida configurada")
    void deveIdentificarChaveValida() {
        ReflectionTestUtils.setField(aiService, "apiKey", "AIzaSyD-teste_chave_valida_gemini");
        assertTrue(aiService.isConfigurado());
    }

    @Test
    @DisplayName("Deve retornar status CONFIGURACAO_PENDENTE quando tentar gerar sem chave")
    void deveRetornarConfiguracaoPendenteSemChave() {
        ReflectionTestUtils.setField(aiService, "apiKey", "");

        AiInsightDTO resultado = aiService.gerarInsights(10L, LocalDate.now(), LocalDate.now(), usuarioMock);

        assertNotNull(resultado);
        assertEquals("CONFIGURACAO_PENDENTE", resultado.getStatus());
        assertFalse(resultado.isConfigurado());
        verify(carteiraService).validarMembro(10L, 1L);
    }

    @Test
    @DisplayName("Deve retornar status SEM_DADOS quando a carteira não possui transações no período")
    void deveRetornarSemDadosQuandoCarteiraVazia() {
        ReflectionTestUtils.setField(aiService, "apiKey", "AIzaSyD-teste_chave_valida_gemini");

        RelatorioFinanceiroDTO relatorioVazio = new RelatorioFinanceiroDTO();
        relatorioVazio.setTotalTransacoes(0);
        relatorioVazio.setPeriodoDescricao("Novembro/2026");

        when(transacaoService.gerarRelatorioFinanceiro(10L, null, null, null, null, null, usuarioMock))
                .thenReturn(relatorioVazio);

        AiInsightDTO resultado = aiService.gerarInsights(10L, null, null, usuarioMock);

        assertNotNull(resultado);
        assertEquals("SEM_DADOS", resultado.getStatus());
        assertTrue(resultado.isConfigurado());
    }
}

