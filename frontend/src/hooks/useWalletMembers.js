import { useCallback, useEffect, useState } from "react";
import CarteiraService from "@/services/CarteiraService";
import { useConfirm } from "@/components/ui/feedback-provider";
import { mensagemDeErro } from "@/lib/format";

const carteiraService = new CarteiraService();

// Toda a lógica de membros de uma carteira. Antes estava copiada (~120 linhas)
// no Painel e em Carteiras, com mensagens ligeiramente diferentes.
export function useWalletMembers(carteiraId, habilitado = true) {
    const confirmar = useConfirm();
    const [membros, setMembros] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const recarregar = useCallback(async () => {
        if (!carteiraId) return;
        setCarregando(true);
        try {
            const lista = await carteiraService.listarMembros(carteiraId);
            setMembros(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error("Erro ao listar membros:", err);
            setErro("Não foi possível carregar os membros desta carteira.");
        } finally {
            setCarregando(false);
        }
    }, [carteiraId]);

    useEffect(() => {
        setErro("");
        setSucesso("");
        if (habilitado && carteiraId) recarregar();
        else setMembros([]);
    }, [carteiraId, habilitado, recarregar]);

    const avisar = (texto) => {
        setSucesso(texto);
        window.setTimeout(() => setSucesso(""), 4000);
    };

    const executar = async (acao, textoSucesso, textoErro) => {
        setErro("");
        setSucesso("");
        try {
            await acao();
            avisar(textoSucesso);
            await recarregar();
            return true;
        } catch (err) {
            setErro(mensagemDeErro(err, textoErro));
            return false;
        }
    };

    const adicionar = async ({ email, papel }) => {
        if (!email.trim()) {
            setErro("Informe o e-mail da pessoa que vai receber acesso.");
            return false;
        }
        setEnviando(true);
        const ok = await executar(
            () => carteiraService.adicionarMembro(carteiraId, { email: email.trim(), role: papel }),
            "Acesso concedido.",
            "Não foi possível adicionar o membro."
        );
        setEnviando(false);
        return ok;
    };

    const alterarPapel = (usuarioId, papel) =>
        executar(
            () => carteiraService.alterarPapelMembro(carteiraId, usuarioId, { role: papel }),
            "Permissão atualizada.",
            "Não foi possível alterar a permissão."
        );

    const remover = async (usuarioId, nome) => {
        const ok = await confirmar({
            titulo: "Remover acesso",
            mensagem: `${nome || "Este membro"} deixará de ver esta carteira.`,
            confirmar: "Remover",
            perigo: true,
        });
        if (!ok) return false;
        return executar(
            () => carteiraService.removerMembro(carteiraId, usuarioId),
            "Membro removido.",
            "Não foi possível remover o membro."
        );
    };

    return { membros, carregando, enviando, erro, sucesso, recarregar, adicionar, alterarPapel, remover };
}
