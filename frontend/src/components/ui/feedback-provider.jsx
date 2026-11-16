import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "./modal";
import { Button } from "./button";

// Substitui alert() e confirm() do navegador por componentes consistentes com o resto do app.
const FeedbackContext = createContext(null);

const ICONES = { success: CheckCircle2, error: AlertCircle, info: Info };

export function FeedbackProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [pedido, setPedido] = useState(null);
    const proximoId = useRef(1);

    const remover = useCallback((id) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);

    const mostrar = useCallback(
        (tone, texto, duracao = 5000) => {
            const id = proximoId.current++;
            setToasts((lista) => [...lista.slice(-2), { id, tone, texto }]);
            window.setTimeout(() => remover(id), duracao);
        },
        [remover]
    );

    const toast = useMemo(
        () => ({
            success: (t, d) => mostrar("success", t, d),
            error: (t, d) => mostrar("error", t, d ?? 7000),
            info: (t, d) => mostrar("info", t, d),
        }),
        [mostrar]
    );

    // confirmar({ titulo, mensagem, confirmar, perigo }) devolve Promise<boolean>.
    const confirmar = useCallback(
        (opcoes) => new Promise((resolve) => setPedido({ ...opcoes, resolve })),
        []
    );

    const responder = (resposta) => {
        pedido?.resolve(resposta);
        setPedido(null);
    };

    return (
        <FeedbackContext.Provider value={{ toast, confirmar }}>
            {children}

            <div className="toasts" aria-live="polite">
                {toasts.map(({ id, tone, texto }) => {
                    const Icone = ICONES[tone];
                    return (
                        <div key={id} className="toast" data-tone={tone}>
                            <Icone className="icon" aria-hidden="true" />
                            <span className="toast__text">{texto}</span>
                            <button type="button" className="toast__close" onClick={() => remover(id)} aria-label="Dispensar">
                                <X className="icon icon--sm" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <Modal open={!!pedido} onClose={() => responder(false)} title={pedido?.titulo || "Confirmar ação"}>
                <ModalBody>
                    <p>{pedido?.mensagem}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={() => responder(false)}>
                        Cancelar
                    </Button>
                    <Button variant={pedido?.perigo ? "danger-solid" : "primary"} onClick={() => responder(true)}>
                        {pedido?.confirmar || "Confirmar"}
                    </Button>
                </ModalFooter>
            </Modal>
        </FeedbackContext.Provider>
    );
}

export const useToast = () => useContext(FeedbackContext).toast;
export const useConfirm = () => useContext(FeedbackContext).confirmar;
