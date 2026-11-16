import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Gera as classes do botão. Útil para <Link> que precisa parecer botão.
export const buttonClass = ({ variant = "primary", size, block, icon, className } = {}) =>
    cn(
        "btn",
        variant !== "primary" && `btn--${variant}`,
        size === "sm" && "btn--sm",
        block && "btn--block",
        icon && "btn--icon",
        className
    );

// variant: primary | secondary | ghost | danger | danger-solid
// loading troca o rótulo por um indicador e bloqueia cliques repetidos.
export function Button({
    variant = "primary",
    size,
    block,
    icon,
    loading = false,
    type = "button",
    className,
    children,
    disabled,
    ...props
}) {
    return (
        <button
            type={type}
            className={buttonClass({ variant, size, block, icon, className })}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading && <RefreshCw className="icon icon--sm spin" aria-hidden="true" />}
            {children}
        </button>
    );
}
