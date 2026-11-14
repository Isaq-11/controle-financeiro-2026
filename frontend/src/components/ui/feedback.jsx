import { cn } from "@/lib/utils";

export function Spinner({ className }) {
    return <div className={cn("spinner", className)} role="status" aria-label="Carregando" />;
}

export function LoadingState({ label = "Carregando...", screen }) {
    return (
        <div className={cn("loading", screen && "loading--screen")}>
            <Spinner />
            <p>{label}</p>
        </div>
    );
}

// Todo estado vazio explica o que aconteceu e oferece o próximo passo.
export function EmptyState({ icon: Icone, title, children, action }) {
    return (
        <div className="empty">
            {Icone && <Icone className="icon icon--lg" aria-hidden="true" />}
            <p className="empty__title">{title}</p>
            {children && <p className="small">{children}</p>}
            {action}
        </div>
    );
}
