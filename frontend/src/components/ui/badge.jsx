import { cn } from "@/lib/utils";

// tone: neutral | income | expense | warning | info | ai
export function Badge({ tone = "neutral", icon: Icon, className, children }) {
    return (
        <span className={cn("badge", tone !== "neutral" && `badge--${tone}`, className)}>
            {Icon && <Icon className="icon icon--sm" aria-hidden="true" />}
            {children}
        </span>
    );
}

// Papéis de carteira usados em mais de uma tela.
export function RoleBadge({ papel }) {
    const tone = papel === "DONO" ? "warning" : papel === "EDITOR" ? "income" : "neutral";
    const rotulo = papel === "DONO" ? "Dono" : papel === "EDITOR" ? "Editor" : "Visualizador";
    return <Badge tone={tone}>{rotulo}</Badge>;
}
