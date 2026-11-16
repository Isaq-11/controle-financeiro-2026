import { InlineSelect } from "@/components/ui/field";

// Seletor de carteira único para Painel, Categorias e Relatórios
// (antes: três implementações diferentes — select, botões e select com rótulo).
export default function WalletSwitcher({ carteiras, valor, onChange, usuarioId, className }) {
    if (!carteiras.length) return null;
    return (
        <InlineSelect
            aria-label="Carteira"
            className={className}
            value={valor ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
        >
            {carteiras.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.nome}
                    {c.dono?.id !== usuarioId ? " (compartilhada)" : ""}
                </option>
            ))}
        </InlineSelect>
    );
}
