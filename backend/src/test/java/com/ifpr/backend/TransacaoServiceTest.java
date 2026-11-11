package com.ifpr.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ifpr.backend.dto.RelatorioFinanceiroDTO;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TransacaoRepository;
import com.ifpr.backend.service.CarteiraService;
import com.ifpr.backend.service.SseNotificacaoService;
import com.ifpr.backend.service.TransacaoService;

@ExtendWith(MockitoExtension.class)
class TransacaoServiceTest {

    @Mock
    private TransacaoRepository transacaoRepository;

    @Mock
    private CarteiraService carteiraService;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private SseNotificacaoService sseNotificacaoService;

    @InjectMocks
    private TransacaoService transacaoService;

    private Usuario usuarioMock;
    private Carteira carteiraMock;
    private Categoria categoriaMock;

    @BeforeEach
    void setUp() {
        usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setName("Ana Souza");
        usuarioMock.setEmail("ana@teste.com");

        carteiraMock = new Carteira();
        carteiraMock.setId(10L);
        carteiraMock.setNome("Carteira Principal");
        carteiraMock.setDono(usuarioMock);

        categoriaMock = new Categoria();
        categoriaMock.setId(5L);
        categoriaMock.setNome("Alimentação");
        categoriaMock.setTipo(TipoTransacao.DESPESA);
    }

    @Test
    @DisplayName("Deve criar transação com sucesso e notificar membros via SSE")
    void deveCriarTransacaoComSucesso() {
        Transacao transacao = new Transacao();
        transacao.setDescricao("Supermercado Mensal");
        transacao.setTipo(TipoTransacao.DESPESA);
        transacao.setValor(new BigDecimal("350.00"));
        transacao.setData(LocalDate.now());

        when(carteiraService.buscarPorId(10L, 1L)).thenReturn(carteiraMock);
        when(categoriaRepository.findById(5L)).thenReturn(Optional.of(categoriaMock));
        when(transacaoRepository.save(any(Transacao.class))).thenAnswer(i -> {
            Transacao t = i.getArgument(0);
            t.setId(100L);
            return t;
        });

        Transacao salva = transacaoService.criar(10L, transacao, 5L, usuarioMock);

        assertNotNull(salva);
        assertEquals(100L, salva.getId());
        assertEquals("Supermercado Mensal", salva.getDescricao());
        assertEquals(usuarioMock, salva.getCriadoPor());
        verify(carteiraService).validarPermissaoEscrita(10L, 1L);
        verify(sseNotificacaoService).notificarMembrosCarteira(eq(10L), eq("transacao-alterada"), any());
    }

    @Test
    @DisplayName("Deve gerar relatório financeiro consolidado com indicadores corretos")
    void deveGerarRelatorioFinanceiro() {
        LocalDate inicio = LocalDate.of(2026, 10, 1);
        LocalDate fim = LocalDate.of(2026, 10, 31);

        Transacao receita = new Transacao();
        receita.setId(1L);
        receita.setTipo(TipoTransacao.RECEITA);
        receita.setValor(new BigDecimal("5000.00"));
        receita.setData(LocalDate.of(2026, 10, 5));
        receita.setCriadoPor(usuarioMock);

        Transacao despesa = new Transacao();
        despesa.setId(2L);
        despesa.setTipo(TipoTransacao.DESPESA);
        despesa.setValor(new BigDecimal("2000.00"));
        despesa.setData(LocalDate.of(2026, 10, 15));
        despesa.setCategoria(categoriaMock);
        despesa.setCriadoPor(usuarioMock);

        when(transacaoRepository.findParaRelatorio(eq(10L), any(), any(), any(), eq(inicio), eq(fim)))
                .thenReturn(List.of(receita, despesa));

        RelatorioFinanceiroDTO relatorio = transacaoService.gerarRelatorioFinanceiro(
                10L, inicio, fim, null, null, null, usuarioMock);

        assertNotNull(relatorio);
        assertEquals(new BigDecimal("5000.00"), relatorio.getTotalReceitas());
        assertEquals(new BigDecimal("2000.00"), relatorio.getTotalDespesas());
        assertEquals(new BigDecimal("3000.00"), relatorio.getSaldoLiquido());
        assertEquals(2, relatorio.getTotalTransacoes());
        // Taxa de poupança: (5000 - 2000) / 5000 * 100 = 60.00%
        assertEquals(new BigDecimal("60.00"), relatorio.getTaxaPoupanca());
    }
}
