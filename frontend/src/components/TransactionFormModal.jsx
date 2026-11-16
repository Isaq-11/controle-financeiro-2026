import { useState } from "react";
import { FormModal } from "@/components/ui/modal";
import { TextField, SelectField, Field } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Alert } from "@/components/ui/alert";
import { converterValorBR, mensagemDeErro } from "@/lib/format";

const TIPOS = [
    { value: "DESPESA", label: "Despesa", tone: "expense" },
    { value: "RECEITA", label: "Receita", tone: "income" },
];

// Formulário único de lançamento (novo e edição).
// onSubmit({ descricao, valor, tipo, categoriaId }) deve lançar erro se falhar.
export default function TransactionFormModal({ open, onClose, transacao, categorias, onSubmit }) {
    return (
        <Inner
            key={open ? (transacao?.id ?? "nova") : "fechado"}
            open={open}
            onClose={onClose}
            transacao={transacao}
            categorias={categorias}
            onSubmit={onSubmit}
        />
    );
}

function Inner({ open, onClose, transacao, categorias, onSubmit }) {
    const [tipo, setTipo] = useState(transacao?.tipo || "DESPESA");
    const [descricao, setDescricao] = useState(transacao?.descricao || "");
    const [valor, setValor] = useState(transacao?.valor ? String(transacao.valor).replace(".", ",") : "");
    const [categoriaId, setCategoriaId] = useState(transacao?.categoria?.id || "");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    const opcoes = (categorias || []).filter((c) => !c.tipo || c.tipo === tipo);

    const trocarTipo = (novo) => {
        setTipo(novo);
        // Categoria de outro tipo deixa de fazer sentido.
        const atual = (categorias || []).find((c) => String(c.id) === String(categoriaId));
        if (atual?.tipo && atual.tipo !== novo) setCategoriaId("");
    };

    const enviar = async () => {
        const numero = converterValorBR(valor);
        if (!descricao.trim()) return setErro("Descreva o lançamento.");
        if (Number.isNaN(numero) || numero <= 0) return setErro("Informe um valor maior que zero.");
        setErro("");
        setEnviando(true);
        try {
            await onSubmit({ descricao: descricao.trim(), valor: numero, tipo, categoriaId: categoriaId || null });
        } catch (err) {
            setErro(mensagemDeErro(err, "Não foi possível salvar o lançamento."));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={transacao ? "Editar lançamento" : "Novo lançamento"}
            submitLabel="Salvar"
            submitting={enviando}
            onSubmit={enviar}
        >
            {erro && <Alert>{erro}</Alert>}
            <Field label="Tipo">
                <Segmented block label="Tipo de lançamento" options={TIPOS} value={tipo} onChange={trocarTipo} />
            </Field>
            <TextField
                label="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: Mercado, Salário"
                autoFocus
            />
            <TextField
                label="Valor (R$)"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
            />
            {opcoes.length > 0 && (
                <SelectField label="Categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                    <option value="">Sem categoria</option>
                    {opcoes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nome}
                        </option>
                    ))}
                </SelectField>
            )}
        </FormModal>
    );
}
