// Mostra se a conexão em tempo real (SSE) está ativa.
export default function LiveIndicator({ conectado }) {
    return (
        <span className="live" data-on={conectado} role="status" title="Atualizações em tempo real">
            <span className="live__dot" aria-hidden="true" />
            {conectado ? "Ao vivo" : "Conectando..."}
        </span>
    );
}
