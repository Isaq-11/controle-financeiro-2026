package com.ifpr.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.PapelCarteira;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.CarteiraMembroRepository;
import com.ifpr.backend.repository.CarteiraRepository;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TransacaoRepository;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private CarteiraRepository carteiraRepository;

    @Autowired
    private CarteiraMembroRepository carteiraMembroRepository;

    @Autowired
    private SseNotificacaoService sseNotificacaoService;

    // Busca categorias de uma carteira específica (com auto-geração das categorias padrão caso ainda não existam)
    public List<Categoria> buscarPorCarteira(Long carteiraId, TipoTransacao tipo, Usuario usuario) {
        validarMembro(carteiraId, usuario.getId());

        List<Categoria> categorias = categoriaRepository.findByCarteiraId(carteiraId);

        // Se a carteira ainda não possui categorias vinculadas, gera as categorias padrão para ela
        if (categorias.isEmpty()) {
            Carteira carteira = carteiraRepository.findById(carteiraId)
                    .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));
            criarCategoriasPadraoParaCarteira(carteira, carteira.getDono());
            categorias = categoriaRepository.findByCarteiraId(carteiraId);
        }

        if (tipo != null) {
            return categoriaRepository.findByCarteiraIdAndTipo(carteiraId, tipo);
        }
        return categorias;
    }

    // Busca todas as categorias do usuário (fallback / legado)
    public List<Categoria> buscarPorUsuario(Long usuarioId, TipoTransacao tipo) {
        if (tipo != null) {
            return categoriaRepository.findByUsuarioIdAndTipo(usuarioId, tipo);
        }
        return categoriaRepository.findByUsuarioId(usuarioId);
    }

    // Busca categoria por ID
    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com id: " + id));
    }

    // Cria uma nova categoria vinculada a uma carteira (apenas o DONO tem permissão)
    public Categoria salvarParaCarteira(Long carteiraId, Categoria categoria, Usuario usuario) {
        validarPapelDono(carteiraId, usuario.getId());

        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada com id: " + carteiraId));

        categoria.setCarteira(carteira);
        categoria.setUsuario(usuario);
        Categoria salva = categoriaRepository.save(categoria);

        // Dispara evento SSE em tempo real para os membros da carteira
        Map<String, Object> payload = Map.of(
            "carteiraId", carteiraId,
            "acao", "CATEGORIA_CRIADA",
            "categoriaId", salva.getId(),
            "nome", salva.getNome(),
            "tipo", salva.getTipo().name()
        );
        sseNotificacaoService.notificarMembrosCarteira(carteiraId, "carteira-alterada", payload);

        return salva;
    }

    // Cria uma categoria genérica
    public Categoria salvar(Categoria categoria, Usuario usuario) {
        categoria.setUsuario(usuario);
        return categoriaRepository.save(categoria);
    }

    // Atualiza uma categoria (se for de carteira, apenas o DONO da carteira pode alterar)
    public Categoria atualizar(Long id, Categoria categoriaAtualizada, Usuario usuario) {
        Categoria dbCategoria = buscarPorId(id);

        if (dbCategoria.getCarteira() != null) {
            validarPapelDono(dbCategoria.getCarteira().getId(), usuario.getId());
        } else if (!dbCategoria.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Você não tem permissão para alterar esta categoria.");
        }

        dbCategoria.setNome(categoriaAtualizada.getNome());
        dbCategoria.setTipo(categoriaAtualizada.getTipo());
        dbCategoria.setCor(categoriaAtualizada.getCor());
        dbCategoria.setIcone(categoriaAtualizada.getIcone());

        Categoria salva = categoriaRepository.save(dbCategoria);

        if (dbCategoria.getCarteira() != null) {
            Map<String, Object> payload = Map.of(
                "carteiraId", dbCategoria.getCarteira().getId(),
                "acao", "CATEGORIA_ATUALIZADA",
                "categoriaId", salva.getId(),
                "nome", salva.getNome()
            );
            sseNotificacaoService.notificarMembrosCarteira(dbCategoria.getCarteira().getId(), "carteira-alterada", payload);
        }

        return salva;
    }

    // Exclui uma categoria (apenas DONO, e impede exclusão se houver transações vinculadas)
    public void excluir(Long id, Usuario usuario) {
        Categoria dbCategoria = buscarPorId(id);

        if (dbCategoria.getCarteira() != null) {
            validarPapelDono(dbCategoria.getCarteira().getId(), usuario.getId());
        } else if (!dbCategoria.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Você não tem permissão para excluir esta categoria.");
        }

        boolean temTransacoes = transacaoRepository.existsByCategoriaId(id);
        if (temTransacoes) {
            throw new BusinessException("Não é possível excluir esta categoria porque já existem transações cadastradas com ela.");
        }

        Long walletId = dbCategoria.getCarteira() != null ? dbCategoria.getCarteira().getId() : null;
        categoriaRepository.delete(dbCategoria);

        if (walletId != null) {
            Map<String, Object> payload = Map.of(
                "carteiraId", walletId,
                "acao", "CATEGORIA_EXCLUIDA",
                "categoriaId", id
            );
            sseNotificacaoService.notificarMembrosCarteira(walletId, "carteira-alterada", payload);
        }
    }

    // Pré-popula categorias padrão para uma nova carteira
    public void criarCategoriasPadraoParaCarteira(Carteira carteira, Usuario dono) {
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Salário", TipoTransacao.RECEITA, "#10B981", "wallet");
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Investimentos", TipoTransacao.RECEITA, "#3B82F6", "trending-up");
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Outras Receitas", TipoTransacao.RECEITA, "#8B5CF6", "dollar-sign");
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Alimentação", TipoTransacao.DESPESA, "#EF4444", "shopping-bag");
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Transporte", TipoTransacao.DESPESA, "#F59E0B", "car");
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Moradia", TipoTransacao.DESPESA, "#6366F1", "home");
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Lazer", TipoTransacao.DESPESA, "#EC4899", "smile");
        criarCategoriaCarteiraSeNaoExistir(carteira, dono, "Saúde", TipoTransacao.DESPESA, "#14B8A6", "heart-pulse");
    }

    private void criarCategoriaCarteiraSeNaoExistir(Carteira carteira, Usuario dono, String nome, TipoTransacao tipo, String cor, String icone) {
        Categoria cat = new Categoria();
        cat.setCarteira(carteira);
        cat.setUsuario(dono);
        cat.setNome(nome);
        cat.setTipo(tipo);
        cat.setCor(cor);
        cat.setIcone(icone);
        categoriaRepository.save(cat);
    }

    // Pré-popula categorias padrão de usuário (legado)
    public void criarCategoriasPadrao(Usuario usuario) {
        criarCategoriaSeNaoExistir(usuario, "Salário", TipoTransacao.RECEITA, "#10B981", "wallet");
        criarCategoriaSeNaoExistir(usuario, "Investimentos", TipoTransacao.RECEITA, "#3B82F6", "trending-up");
        criarCategoriaSeNaoExistir(usuario, "Alimentação", TipoTransacao.DESPESA, "#EF4444", "shopping-bag");
        criarCategoriaSeNaoExistir(usuario, "Transporte", TipoTransacao.DESPESA, "#F59E0B", "car");
        criarCategoriaSeNaoExistir(usuario, "Moradia", TipoTransacao.DESPESA, "#8B5CF6", "home");
        criarCategoriaSeNaoExistir(usuario, "Lazer", TipoTransacao.DESPESA, "#EC4899", "smile");
    }

    private void criarCategoriaSeNaoExistir(Usuario usuario, String nome, TipoTransacao tipo, String cor, String icone) {
        Categoria cat = new Categoria();
        cat.setUsuario(usuario);
        cat.setNome(nome);
        cat.setTipo(tipo);
        cat.setCor(cor);
        cat.setIcone(icone);
        categoriaRepository.save(cat);
    }

    // Validações
    public void validarPapelDono(Long carteiraId, Long usuarioId) {
        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, usuarioId)
                .orElseThrow(() -> new BusinessException("Acesso negado: você não é membro desta carteira."));

        if (membro.getPapel() != PapelCarteira.DONO) {
            throw new BusinessException("Acesso negado: apenas o DONO da carteira pode gerenciar categorias.");
        }
    }

    public void validarMembro(Long carteiraId, Long usuarioId) {
        boolean ehMembro = carteiraMembroRepository.existsByCarteiraIdAndUsuarioId(carteiraId, usuarioId);
        if (!ehMembro) {
            throw new BusinessException("Acesso negado: você não é membro desta carteira.");
        }
    }
}
