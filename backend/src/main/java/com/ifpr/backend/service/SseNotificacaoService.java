package com.ifpr.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.repository.CarteiraMembroRepository;

@Service
public class SseNotificacaoService {

    private static final Logger logger = LoggerFactory.getLogger(SseNotificacaoService.class);

    // Timeout de 30 minutos para a conexão SSE mantida aberta
    private static final Long TIMEOUT_MS = 30 * 60 * 1000L;

    // Mapa thread-safe: usuarioId -> lista de conexões (uma por aba/dispositivo)
    private final Map<Long, List<SseEmitter>> usuarioEmitters = new ConcurrentHashMap<>();

    @Autowired
    private CarteiraMembroRepository carteiraMembroRepository;

    /**
     * Registra uma nova conexão SSE para o usuário autenticado.
     */
    public SseEmitter registrar(Long usuarioId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);

        usuarioEmitters.computeIfAbsent(usuarioId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> removerEmitter(usuarioId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Envia o primeiro evento de confirmação de conexão
        try {
            emitter.send(SseEmitter.event()
                    .name("conectado")
                    .data("Conexão SSE estabelecida com sucesso")
            );
        } catch (IOException e) {
            cleanup.run();
        }

        logger.info("Nova conexão SSE estabelecida para o usuário ID: {}", usuarioId);
        return emitter;
    }

    private void removerEmitter(Long usuarioId, SseEmitter emitter) {
        List<SseEmitter> emitters = usuarioEmitters.get(usuarioId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                usuarioEmitters.remove(usuarioId);
            }
        }
        logger.debug("Conexão SSE encerrada/removida para o usuário ID: {}", usuarioId);
    }

    /**
     * Notifica um usuário específico através de todos os seus emitters ativos.
     */
    public void notificarUsuario(Long usuarioId, String evento, Object dados) {
        List<SseEmitter> emitters = usuarioEmitters.get(usuarioId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(evento)
                        .data(dados, MediaType.APPLICATION_JSON)
                );
            } catch (Exception e) {
                logger.warn("Falha ao enviar evento SSE para usuário {}: {}", usuarioId, e.getMessage());
                removerEmitter(usuarioId, emitter);
            }
        }
    }

    /**
     * Notifica todos os membros que participam de uma determinada carteira compartilhada.
     */
    public void notificarMembrosCarteira(Long carteiraId, String evento, Object dados) {
        List<CarteiraMembro> membros = carteiraMembroRepository.findByCarteiraId(carteiraId);
        for (CarteiraMembro membro : membros) {
            if (membro.getUsuario() != null && membro.getUsuario().getId() != null) {
                notificarUsuario(membro.getUsuario().getId(), evento, dados);
            }
        }
    }

    /**
     * Heartbeat periódico a cada 25 segundos para manter a conexão aberta em proxies,
     * balanceadores de carga e firewalls, evitando desconexão por inatividade.
     */
    @Scheduled(fixedRate = 25000)
    public void enviarHeartbeat() {
        if (usuarioEmitters.isEmpty()) {
            return;
        }

        usuarioEmitters.forEach((usuarioId, emitters) -> {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().comment("ping"));
                } catch (Exception e) {
                    removerEmitter(usuarioId, emitter);
                }
            }
        });
    }
}
