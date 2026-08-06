package com.ifpr.backend.service;

import java.util.List;

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

        return carteiraSalva;
    }

    public Carteira atualizar(Long id, Carteira carteiraAtualizada, Usuario usuarioAutenticado) {
        Carteira dbCarteira = carteiraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada com id: " + id));

        validarPapelDono(id, usuarioAutenticado.getId());

        dbCarteira.setNome(carteiraAtualizada.getNome());
        dbCarteira.setDescricao(carteiraAtualizada.getDescricao());

        return carteiraRepository.save(dbCarteira);
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

        return carteiraMembroRepository.save(novoMembro);
    }

    public CarteiraMembro alterarPapelMembro(Long carteiraId, Long targetUserId, PapelCarteira novoPapel, Usuario usuarioAutenticado) {
        validarPapelDono(carteiraId, usuarioAutenticado.getId());

        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado nesta carteira."));

        membro.setPapel(novoPapel);
        return carteiraMembroRepository.save(membro);
    }

    public void removerMembro(Long carteiraId, Long targetUserId, Usuario usuarioAutenticado) {
        validarPapelDono(carteiraId, usuarioAutenticado.getId());

        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado nesta carteira."));

        carteiraMembroRepository.delete(membro);
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
