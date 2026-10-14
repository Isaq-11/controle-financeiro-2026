const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

/**
 * Conecta ao stream de eventos em tempo real (SSE - Server-Sent Events).
 * 
 * @param {string} token - Token de autenticação do usuário.
 * @param {Object} callbacks - Funções de retorno chamadas quando eventos ocorrem.
 * @param {function} callbacks.onConectado - Chamado quando a conexão é confirmada pelo backend.
 * @param {function} callbacks.onTransacaoAlterada - Chamado quando uma transação for criada/atualizada/removida.
 * @param {function} callbacks.onCarteiraAlterada - Chamado quando membros ou dados de carteira mudarem.
 * @param {function} callbacks.onStatus - Chamado para indicar se está 'conectado' ou 'desconectado'.
 * @returns {function} Função de encerramento da conexão (cleanup).
 */
export function conectarEventosSse(token, callbacks = {}) {
    if (!token) {
        if (callbacks.onStatus) callbacks.onStatus(false);
        return () => {};
    }

    const streamUrl = `${API_BASE_URL}/api/v1/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    if (callbacks.onStatus) callbacks.onStatus(false); // Inicia tentando conectar

    // 1. Confirmação inicial do backend
    eventSource.addEventListener("conectado", (e) => {
        if (callbacks.onStatus) callbacks.onStatus(true);
        if (callbacks.onConectado) callbacks.onConectado(e.data);
    });

    // 2. Mudanças em transações (Criação, Edição, Exclusão)
    eventSource.addEventListener("transacao-alterada", (e) => {
        try {
            const payload = JSON.parse(e.data);
            if (callbacks.onTransacaoAlterada) callbacks.onTransacaoAlterada(payload);
        } catch (err) {
            console.error("Erro ao processar evento transacao-alterada:", err);
        }
    });

    // 3. Mudanças na carteira ou membros
    eventSource.addEventListener("carteira-alterada", (e) => {
        try {
            const payload = JSON.parse(e.data);
            if (callbacks.onCarteiraAlterada) callbacks.onCarteiraAlterada(payload);
        } catch (err) {
            console.error("Erro ao processar evento carteira-alterada:", err);
        }
    });

    // 4. Reconexão automática em caso de erro / queda
    eventSource.onerror = () => {
        if (callbacks.onStatus) callbacks.onStatus(false);
    };

    // Retorna método de encerramento para useEffect cleanup
    return () => {
        eventSource.close();
    };
}

export default conectarEventosSse;

