import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { TextField } from "@/components/ui/field";
import { calcularForcaSenha } from "@/utils/validarForm";

// Medidor simples em 3 níveis, derivado do rótulo já calculado em validarForm.
function PasswordStrength({ senha }) {
    const { label } = calcularForcaSenha(senha);
    if (!senha) return null;
    const nivel = label === "Senha Forte" ? 3 : label === "Senha Média" ? 2 : 1;
    return (
        <div className="strength" data-level={nivel} aria-live="polite">
            <div className="strength__bars" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <span>{label}</span>
        </div>
    );
}

// Campo de senha com botão de mostrar/ocultar (acessível) e medidor opcional.
// Substitui os ~25 trechos duplicados nas telas de login, cadastro e troca de senha.
export function PasswordField({ showStrength, value, ...props }) {
    const [visivel, setVisivel] = useState(false);
    return (
        <div className="stack stack--sm">
            <TextField
                icon={LockKeyhole}
                type={visivel ? "text" : "password"}
                value={value}
                action={
                    <button
                        type="button"
                        className="input-wrap__action"
                        onClick={() => setVisivel((v) => !v)}
                        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
                        aria-pressed={visivel}
                    >
                        {visivel ? <EyeOff className="icon" /> : <Eye className="icon" />}
                    </button>
                }
                {...props}
            />
            {showStrength && <PasswordStrength senha={value} />}
        </div>
    );
}
