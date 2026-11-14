import { useState } from "react";
import { FormModal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { mensagemDeErro } from "@/lib/format";

// Criar e editar carteira usam o mesmo formulário (eram 3 modais quase idênticos).
// onSubmit({ nome, descricao }) deve lançar erro se falhar; o modal exibe a mensagem.
export default function WalletFormModal({ open, onClose, carteira, onSubmit }) {
    const editando = !!carteira;
    return (
        <FormInner
            key={open ? (carteira?.id ?? "nova") : "fechado"}
            open={open}
            onClose={onClose}
            carteira={carteira}
            editando={editando}
            onSubmit={onSubmit}
        />
    );
}

function FormInner({ open, onClose, carteira, editando, onSubmit }) {
    const [nome, setNome] = useState(carteira?.nome || "");
    const [descricao, setDescricao] = useState(carteira?.descricao || "");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    const enviar = async () => {
        if (!nome.trim()) {
            setErro("Dê um nome para a carteira.");
            return;
        }
        setErro("");
        setEnviando(true);
        try {
            await onSubmit({ nome: nome.trim(), descricao: descricao.trim() });
        } catch (err) {
            setErro(mensagemDeErro(err, "Não foi possível salvar a carteira."));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={editando ? "Editar carteira" : "Nova carteira"}
            submitLabel={editando ? "Salvar" : "Criar carteira"}
            submitting={enviando}
            onSubmit={enviar}
        >
            {erro && <Alert>{erro}</Alert>}
            <TextField
                label="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Casa, Viagem 2027"
                autoFocus
                required
            />
            <TextField
                label="Descrição (opcional)"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: Gastos divididos com a família"
            />
        </FormModal>
    );
}
