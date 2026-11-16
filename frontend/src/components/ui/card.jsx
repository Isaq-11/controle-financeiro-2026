import { cn } from "@/lib/utils";

// flush: remove o padding interno (listas e tabelas encostam nas bordas).
export function Card({ flush, muted, className, as: Tag = "section", ...props }) {
    return <Tag className={cn("card", flush && "card--flush", muted && "card--muted", className)} {...props} />;
}

export function CardHeader({ title, subtitle, actions, className }) {
    return (
        <div className={cn("card__header", className)}>
            <div>
                <h2 className="card__title">{title}</h2>
                {subtitle && <p className="card__sub">{subtitle}</p>}
            </div>
            {actions && <div className="cluster">{actions}</div>}
        </div>
    );
}
