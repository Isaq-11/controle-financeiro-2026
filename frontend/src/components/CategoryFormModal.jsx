import { useState } from "react";
import { FormModal } from "@/components/ui/modal";
import { TextField, Field } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Alert } from "@/components/ui/alert";
import CategoryIcon, { ICONES_CATEGORIA } from "@/components/CategoryIcon";
import { mensagemDeErro } from "@/lib/format";

const PALETA = [
    { nome: "Verde", hex: "#10B981" },
    { nome: "Azul", hex: "#3B82F6" },
    { nome: "Violeta", hex: "#8B5CF6" },
    { nome: "Rosa", hex: "#EC4899" },
    { nome: "Âmbar", hex: "#F59E0B" },
    { nome: "Vermelho", hex: "#EF4444" },
    { nome: "Índigo", hex: "#6366F1" },
    { nome: "Turquesa", hex: "#14B8A6" },
    { nome: "Ardósia", hex: "#64748B" },
];

const TIPOS = [
    { value: "DESPESA", label: "Despesa", tone: "expense" },
    { value: "RECEITA", label: "Receita", tone: "income" },
];

export default function CategoryFormModal({ open, onClose, categoria, carteiraNome, onSubmit }) {
    return (
        <Inner
            key={open ? (categoria?.id ?? "nova") : "fechado"}
            open={open}
            onClose={onClose}
            categoria={categoria}
            carteiraNome={carteiraNome}
            onSubmit={onSubmit}
        />
    );
}

function Inner({ open, onClose, categoria, carteiraNome, onSubmit }) {
    const [nome, setNome] = useState(categoria?.nome || "");
    const [tipo, setTipo] = useState(categoria?.tipo || "DESPESA");
    const [cor, setCor] = useState(categoria?.cor || "#EF4444");
    const [icone, setIcone] = useState(categoria?.icone || "tag");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    const trocarTipo = (novo) => {
        setTipo(novo);
        // Sugere a cor padrão do tipo apenas se a pessoa ainda não escolheu outra.
        if (novo === "RECEITA" && cor === "#EF4444") setCor("#10B981");
        if (novo === "DESPESA" && cor === "#10B981") setCor("#EF4444");
    };

    const enviar = async () => {
        if (!nome.trim()) return setErro("Dê um nome para a categoria.");
        setErro("");
        setEnviando(true);
        try {
            await onSubmit({ nome: nome.trim(), tipo, cor, icone });
        } catch (err) {
            setErro(mensagemDeErro(err, "Não foi possível salvar a categoria."));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={categoria ? "Editar categoria" : "Nova categoria"}
            subtitle={carteiraNome && `Carteira: ${carteiraNome}`}
            submitLabel="Salvar"
            submitting={enviando}
            onSubmit={enviar}
        >
            {erro && <Alert>{erro}</Alert>}
            <TextField
                label="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Mercado, Freelance"
                autoFocus
            />
            <Field label="Tipo">
                <Segmented block label="Tipo da categoria" options={TIPOS} value={tipo} onChange={trocarTipo} />
            </Field>
            <Field label="Cor">
                <div className="swatches">
                    {PALETA.map((c) => (
                        <button
                            key={c.hex}
                            type="button"
                            className="swatch"
                            style={{ "--swatch": c.hex }}
                            aria-label={c.nome}
                            aria-pressed={cor.toLowerCase() === c.hex.toLowerCase()}
                            onClick={() => setCor(c.hex)}
                        />
                    ))}
                </div>
                <div className="color-row" style={{ marginTop: "var(--s-2)" }}>
                    <input
                        className="input"
                        type="color"
                        value={cor}
                        onChange={(e) => setCor(e.target.value)}
                        aria-label="Escolher outra cor"
                    />
                    <span className="muted small num">{cor.toUpperCase()}</span>
                </div>
            </Field>
            <Field label="Ícone">
                <div className="icon-choices">
                    {ICONES_CATEGORIA.map((i) => (
                        <button
                            key={i.id}
                            type="button"
                            className="icon-choice"
                            aria-label={i.rotulo}
                            title={i.rotulo}
                            aria-pressed={icone === i.id}
                            onClick={() => setIcone(i.id)}
                        >
                            <CategoryIcon id={i.id} />
                        </button>
                    ))}
                </div>
            </Field>
        </FormModal>
    );
}
