import { Wallet } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

// Moldura única de todas as telas públicas (login, cadastro e recuperação de senha).
// step/totalSteps desenham o progresso do fluxo de recuperação.
export default function AuthLayout({ title, subtitle, step, totalSteps, footer, children }) {
    return (
        <main className="auth">
            <div className="auth__panel">
                <div className="auth__brand">
                    <span className="brand">
                        <span className="brand__mark">
                            <Wallet className="icon icon--sm" aria-hidden="true" />
                        </span>
                        {APP_NAME}
                    </span>
                </div>

                <div className="card stack stack--lg">
                    <div>
                        {totalSteps > 1 && (
                            <div className="steps" role="img" aria-label={`Etapa ${step} de ${totalSteps}`}>
                                {Array.from({ length: totalSteps }, (_, i) => (
                                    <span key={i} data-done={i < step} />
                                ))}
                            </div>
                        )}
                        <h1 className="auth__title">{title}</h1>
                        {subtitle && <p className="auth__sub">{subtitle}</p>}
                    </div>
                    {children}
                </div>

                {footer && <p className="auth__foot">{footer}</p>}
            </div>
        </main>
    );
}
