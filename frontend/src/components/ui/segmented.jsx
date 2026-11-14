import { cn } from "@/lib/utils";

// Escolha única entre poucas opções (tipo de transação, período, filtros).
// options: [{ value, label, tone?: "income" | "expense", icon? }]
export function Segmented({ options, value, onChange, label, block, className }) {
    return (
        <div role="group" aria-label={label} className={cn("segmented", block && "segmented--block", className)}>
            {options.map(({ value: v, label: texto, tone, icon: Icone }) => (
                <button
                    key={v}
                    type="button"
                    className="segmented__item"
                    data-tone={tone}
                    aria-pressed={value === v}
                    onClick={() => onChange(v)}
                >
                    {Icone && <Icone className="icon icon--sm" aria-hidden="true" />}
                    {texto}
                </button>
            ))}
        </div>
    );
}
