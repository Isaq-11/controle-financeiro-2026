package com.ifpr.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TransacaoRepository;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    // Busca todas as categorias do usuário autenticado
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

    // Cria uma nova categoria
    public Categoria salvar(Categoria categoria, Usuario usuario) {
        categoria.setUsuario(usuario);
        return categoriaRepository.save(categoria);
    }

    // Atualiza uma categoria existente
    public Categoria atualizar(Long id, Categoria categoriaAtualizada, Usuario usuario) {
        Categoria dbCategoria = buscarPorId(id);

        if (!dbCategoria.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Você não tem permissão para alterar esta categoria.");
        }

        dbCategoria.setNome(categoriaAtualizada.getNome());
        dbCategoria.setTipo(categoriaAtualizada.getTipo());
        dbCategoria.setCor(categoriaAtualizada.getCor());
        dbCategoria.setIcone(categoriaAtualizada.getIcone());

        return categoriaRepository.save(dbCategoria);
    }

    // Exclui uma categoria (com a regra do PDF: não pode excluir se houver transações vinculadas)
    public void excluir(Long id, Usuario usuario) {
        Categoria dbCategoria = buscarPorId(id);

        if (!dbCategoria.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Você não tem permissão para excluir esta categoria.");
        }

        boolean temTransacoes = transacaoRepository.existsByCategoriaId(id);
        if (temTransacoes) {
            throw new BusinessException("Não é possível excluir uma categoria que possui transações vinculadas.");
        }

        categoriaRepository.delete(dbCategoria);
    }

    // Pré-popula categorias padrão para novos usuários (conforme nota do PDF 2, seção 2.2)
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
}
