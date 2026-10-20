package com.ifpr.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.model.PapelCarteira;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.CarteiraMembroRepository;
import com.ifpr.backend.repository.CarteiraRepository;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class CarteiraService {

    @Autowired
    private CarteiraRepository carteiraRepository;

    @Autowired
    private CarteiraMembroRepository carteiraMembroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SseNotificacaoService sseNotificacaoService;

    @Autowired
    private CategoriaService categoriaService;

    public List<Carteira> buscarTodasDoUsuario(Long usuarioId) {
        return carteiraRepository.findAllByUsuarioId(usuarioId);
    }

    public Carteira buscarPorId(Long id, Long usuarioId) {
        Carteira carteira = carteiraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada com id: " + id));

        validarMembro(id, usuarioId);
        return carteira;
    }

    public Carteira criarCarteira(Carteira carteira, Usuario dono) {
        carteira.setDono(dono);
        Carteira carteiraSalva = carteiraRepository.save(carteira);

        // Adiciona o criador como DONO na tabela CarteiraMembro
        CarteiraMembro membroDono = new CarteiraMembro();
        membroDono.setCarteira(carteiraSalva);
        membroDono.setUsuario(dono);
        membroDono.setPapel(PapelCarteira.DONO);
        carteiraMembroRepository.save(membroDono);

        // Inicializa as categorias padrão para esta carteira
        try {
            categoriaService.criarCategoriasPadraoParaCarteira(carteiraSalva, dono);
        } catch (Exception e) {
            // Log/ignora se já existirem
        }

        return carteiraSalva;
    }

    public Carteira atualizar(Long id, Carteira carteiraAtualizada, Usuario usuarioAutenticado) {
        Carteira dbCarteira = carteiraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada com id: " + id));

        validarPapelDono(id, usuarioAutenticado.getId());

        dbCarteira.setNome(carteiraAtualizada.getNome());
        dbCarteira.setDescricao(carteiraAtualizada.getDescricao());

        Carteira salva = carteiraRepository.save(dbCarteira);

        Map<String, Object> evento = Map.of(
            "carteiraId", id,
            "acao", "CARTEIRA_ATUALIZADA",
            "nome", salva.getNome()
        );
        sseNotificacaoService.notificarMembrosCarteira(id, "carteira-alterada", evento);

        return salva;
    }

    public void excluir(Long id, Usuario usuarioAutenticado) {
        Carteira dbCarteira = carteiraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada com id: " + id));

        validarPapelDono(id, usuarioAutenticado.getId());

        // Remove primeiro os membros vinculados
        List<CarteiraMembro> membros = carteiraMembroRepository.findByCarteiraId(id);
        carteiraMembroRepository.deleteAll(membros);

        carteiraRepository.delete(dbCarteira);
    }

    // Gestão de Membros
    public List<CarteiraMembro> listarMembros(Long carteiraId, Long usuarioId) {
        validarMembro(carteiraId, usuarioId);
        return carteiraMembroRepository.findByCarteiraId(carteiraId);
    }

    public CarteiraMembro adicionarMembro(Long carteiraId, String email, PapelCarteira papel, Usuario usuarioAutenticado) {
        validarPapelDono(carteiraId, usuarioAutenticado.getId());

        Usuario usuarioAdicionar = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com e-mail '" + email + "' não foi encontrado."));

        boolean jaEhMembro = carteiraMembroRepository.existsByCarteiraIdAndUsuarioId(carteiraId, usuarioAdicionar.getId());
        if (jaEhMembro) {
            throw new BusinessException("O usuário informado já é membro desta carteira.");
        }

        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada."));

        CarteiraMembro novoMembro = new CarteiraMembro();
        novoMembro.setCarteira(carteira);
        novoMembro.setUsuario(usuarioAdicionar);
        novoMembro.setPapel(papel != null ? papel : PapelCarteira.VISUALIZADOR);

        CarteiraMembro salvo = carteiraMembroRepository.save(novoMembro);

        Map<String, Object> evento = Map.of(
            "carteiraId", carteiraId,
            "acao", "MEMBRO_ADICIONADO",
            "usuarioId", usuarioAdicionar.getId(),
            "usuarioNome", usuarioAdicionar.getName() != null ? usuarioAdicionar.getName() : usuarioAdicionar.getEmail(),
            "papel", salvo.getPapel().name()
        );
        sseNotificacaoService.notificarMembrosCarteira(carteiraId, "carteira-alterada", evento);
        sseNotificacaoService.notificarUsuario(usuarioAdicionar.getId(), "carteira-alterada", evento);

        return salvo;
    }

    public CarteiraMembro alterarPapelMembro(Long carteiraId, Long targetUserId, PapelCarteira novoPapel, Usuario usuarioAutenticado) {
        validarPapelDono(carteiraId, usuarioAutenticado.getId());

        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado nesta carteira."));

        membro.setPapel(novoPapel);
        CarteiraMembro salvo = carteiraMembroRepository.save(membro);

        Map<String, Object> evento = Map.of(
            "carteiraId", carteiraId,
            "acao", "PAPEL_ALTERADO",
            "usuarioId", targetUserId,
            "papel", novoPapel.name()
        );
        sseNotificacaoService.notificarMembrosCarteira(carteiraId, "carteira-alterada", evento);

        return salvo;
    }

    public void removerMembro(Long carteiraId, Long targetUserId, Usuario usuarioAutenticado) {
        validarPapelDono(carteiraId, usuarioAutenticado.getId());

        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado nesta carteira."));

        carteiraMembroRepository.delete(membro);

        Map<String, Object> evento = Map.of(
            "carteiraId", carteiraId,
            "acao", "MEMBRO_REMOVIDO",
            "usuarioId", targetUserId
        );
        sseNotificacaoService.notificarMembrosCarteira(carteiraId, "carteira-alterada", evento);
        sseNotificacaoService.notificarUsuario(targetUserId, "carteira-alterada", evento);
    }

    // Validações de Permissão
    public void validarMembro(Long carteiraId, Long usuarioId) {
        boolean ehMembro = carteiraMembroRepository.existsByCarteiraIdAndUsuarioId(carteiraId, usuarioId);
        if (!ehMembro) {
            throw new BusinessException("Acesso negado: você não é membro desta carteira.");
        }
    }

    public void validarPermissaoEscrita(Long carteiraId, Long usuarioId) {
        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, usuarioId)
                .orElseThrow(() -> new BusinessException("Acesso negado: você não é membro desta carteira."));

        if (membro.getPapel() == PapelCarteira.VISUALIZADOR) {
            throw new BusinessException("Acesso negado: usuários com perfil VISUALIZADOR não podem realizar alterações.");
        }
    }

    public void validarPapelDono(Long carteiraId, Long usuarioId) {
        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, usuarioId)
                .orElseThrow(() -> new BusinessException("Acesso negado: você não é membro desta carteira."));

        if (membro.getPapel() != PapelCarteira.DONO) {
            throw new BusinessException("Acesso negado: apenas o DONO da carteira pode realizar esta operação.");
        }
    }
}
