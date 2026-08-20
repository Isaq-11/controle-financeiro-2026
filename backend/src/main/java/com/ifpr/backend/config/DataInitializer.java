package com.ifpr.backend.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.CarteiraRepository;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TransacaoRepository;
import com.ifpr.backend.repository.UsuarioRepository;
import com.ifpr.backend.service.CarteiraService;
import com.ifpr.backend.service.CategoriaService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private CarteiraService carteiraService;

    @Autowired
    private CarteiraRepository carteiraRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Override
    public void run(String... args) throws Exception {
        String emailTeste = "usuario@teste.com";

        // Cria o usuário de teste se não existir
        if (!usuarioRepository.existsByEmail(emailTeste)) {
            Usuario usuario = new Usuario();
            usuario.setName("Usuário Estudante");
            usuario.setEmail(emailTeste);
            usuario.setPassword("123456User!");
            Usuario usuarioSalvo = usuarioRepository.save(usuario);

            // Categorias Padrão
            categoriaService.criarCategoriasPadrao(usuarioSalvo);

            // Carteira Padrão
            Carteira carteira = new Carteira();
            carteira.setNome("Minha Carteira Principal");
            carteira.setDescricao("Carteira criada para demonstração de uso do sistema.");
            Carteira carteiraSalva = carteiraService.criarCarteira(carteira, usuarioSalvo);

            // Adicionar Lançamento Inicial de R$ 2.500,00
            List<Categoria> categorias = categoriaRepository.findByUsuarioIdAndTipo(usuarioSalvo.getId(), TipoTransacao.RECEITA);
            Categoria catSalario = categorias.stream()
                    .filter(c -> "Salário".equalsIgnoreCase(c.getNome()))
                    .findFirst()
                    .orElse(categorias.isEmpty() ? null : categorias.get(0));

            Transacao tInicial = new Transacao();
            tInicial.setCarteira(carteiraSalva);
            tInicial.setCriadoPor(usuarioSalvo);
            tInicial.setCategoria(catSalario);
            tInicial.setTipo(TipoTransacao.RECEITA);
            tInicial.setValor(new BigDecimal("2500.00"));
            tInicial.setDescricao("Saldo Inicial da Carteira");
            tInicial.setData(LocalDate.now());
            transacaoRepository.save(tInicial);

            System.out.println(">>> DataInitializer: Usuário de teste criados com R$ 2.500,00 de saldo inicial!");
        }
    }
}
