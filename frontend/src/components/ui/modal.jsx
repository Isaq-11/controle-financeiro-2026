import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// Usa <dialog> nativo: o navegador cuida de foco preso, tecla Esc e inércia do fundo.
// Em telas pequenas vira uma "folha" ancorada na base (CSS).
// O conteúdo só é montado enquanto aberto, então formulários internos reiniciam a cada abertura.
export function Modal({ open, onClose, title, subtitle, wide, footer, children }) {
    const ref = useRef(null);

    useEffect(() => {
        const dialogo = ref.current;
        if (!dialogo) return;
        if (open && !dialogo.open) dialogo.showModal();
        if (!open && dialogo.open) dialogo.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            className={cn("modal", wide && "modal--wide")}
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            onMouseDown={(e) => {
                // Clique no fundo escurecido (o próprio <dialog>) fecha.
                if (e.target === ref.current) onClose();
            }}
            aria-label={typeof title === "string" ? title : undefined}
        >
            {open && (
                <>
                    <div className="modal__header">
                        <div>
                            <h2 className="modal__title">{title}</h2>
                            {subtitle && <p className="card__sub">{subtitle}</p>}
                        </div>
                        <Button variant="ghost" size="sm" icon onClick={onClose} aria-label="Fechar">
                            <X className="icon" />
                        </Button>
                    </div>
                    {children}
                    {footer}
                </>
            )}
        </dialog>
    );
}

export const ModalBody = ({ children }) => <div className="modal__body">{children}</div>;
export const ModalFooter = ({ children }) => <div className="modal__footer">{children}</div>;

// Modal com formulário: o <form> envolve corpo e rodapé para o Enter enviar.
// onSubmit recebe o evento já com preventDefault aplicado.
export function FormModal({ open, onClose, title, subtitle, wide, submitLabel, submitting, onSubmit, children }) {
    return (
        <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} wide={wide}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(e);
                }}
                style={{ display: "contents" }}
                noValidate
            >
                <ModalBody>
                    <div className="stack">{children}</div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={submitting}>
                        {submitLabel}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
