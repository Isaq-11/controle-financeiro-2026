import { formatarDinheiro } from "@/lib/format";

// Cores dos gráficos vêm das variáveis CSS, então acompanham o tema claro/escuro.
export const CORES_GRAFICO = {
    receita: "var(--income)",
    despesa: "var(--expense)",
    eixo: { fill: "var(--ink-3)", fontSize: 12 },
    grade: "var(--line)",
};

export const PALETA_CATEGORIAS = [
    "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B",
    "#EF4444", "#06B6D4", "#6366F1", "#14B8A6", "#84CC16",
];

// Tooltip padrão para todos os gráficos.
export default function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tip">
            {label && <p className="muted" style={{ marginBottom: 4 }}>{label}</p>}
            {payload.map((p) => (
                <div key={p.dataKey || p.name} className="chart-tip__row">
                    <span>
                        <span className="chart-tip__dot" style={{ background: p.color || p.payload?.color || p.fill }} />
                        {p.name}
                    </span>
                    <strong className="num">{formatarDinheiro(p.value)}</strong>
                </div>
            ))}
        </div>
    );
}
