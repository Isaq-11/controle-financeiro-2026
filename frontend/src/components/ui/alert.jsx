import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONES = { error: AlertCircle, success: CheckCircle2, info: Info, warning: AlertTriangle };

// Mensagem persistente dentro da tela ou de um formulário.
// Para avisos rápidos que somem sozinhos, use useToast().
export function Alert({ tone = "error", onClose, action, className, children }) {
    const Icone = ICONES[tone];
    return (
        <div className={cn("alert", `alert--${tone}`, className)} role={tone === "error" ? "alert" : "status"}>
            <Icone className="icon" aria-hidden="true" />
            <div className="alert__body">{children}</div>
            {action}
            {onClose && (
                <button type="button" className="btn btn--ghost btn--icon btn--sm" onClick={onClose} aria-label="Fechar aviso">
                    <X className="icon icon--sm" />
                </button>
            )}
        </div>
    );
}
