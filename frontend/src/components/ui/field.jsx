import { useId } from "react";
import { cn } from "@/lib/utils";

// Estrutura comum de todo campo: rótulo, ajuda e erro ligados por aria-*.
export function Field({ label, htmlFor, hint, error, children, className }) {
    return (
        <div className={cn("field", className)}>
            {label && (
                <label className="field__label" htmlFor={htmlFor}>
                    {label}
                </label>
            )}
            {children}
            {hint && !error && <p className="field__hint">{hint}</p>}
            {error && (
                <p className="field__error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// Campo de texto. `icon` fica à esquerda; `action` é um botão à direita (ex.: mostrar senha).
export function TextField({ label, hint, error, icon: Icon, action, small, className, id, ...props }) {
    const gerado = useId();
    const campoId = id || gerado;
    return (
        <Field label={label} htmlFor={campoId} hint={hint} error={error} className={className}>
            <div className="input-wrap">
                {Icon && <Icon className="icon input-wrap__icon" aria-hidden="true" />}
                <input
                    id={campoId}
                    className={cn("input", small && "input--sm", Icon && "input--with-icon", action && "input--with-action")}
                    aria-invalid={error ? "true" : undefined}
                    {...props}
                />
                {action}
            </div>
        </Field>
    );
}

// Select estilizado (o chevron é desenhado pelo wrapper, não pelo navegador).
export function SelectField({ label, hint, error, small, className, id, children, ...props }) {
    const gerado = useId();
    const campoId = id || gerado;
    return (
        <Field label={label} htmlFor={campoId} hint={hint} error={error} className={className}>
            <div className="select-wrap">
                <select
                    id={campoId}
                    className={cn("select", small && "select--sm")}
                    aria-invalid={error ? "true" : undefined}
                    {...props}
                >
                    {children}
                </select>
            </div>
        </Field>
    );
}

// Select sem rótulo visível, para barras de ferramentas. Exige aria-label.
export function InlineSelect({ small = true, className, children, ...props }) {
    return (
        <div className={cn("select-wrap", className)}>
            <select className={cn("select", small && "select--sm")} {...props}>
                {children}
            </select>
        </div>
    );
}
