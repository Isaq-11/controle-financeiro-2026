import { useState, useEffect, useRef } from "react";
import { Pencil, Plus, Wallet } from "lucide-react";
import CarteiraService from "@/services/CarteiraService";
import { useAuth } from "@/services/AuthContext";
import { conectarEventosSse } from "@/services/SseService";
import { useWalletMembers } from "@/hooks/useWalletMembers";
import WalletFormModal from "@/components/WalletFormModal";
import MembersPanel from "@/components/MembersPanel";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/feedback-provider";
import { nomeDoUsuario } from "@/lib/format";

const carteiraService = new CarteiraService();

const Carteiras = () => {
    const { usuarioLogado } = useAuth();
    const toast = useToast();

    const [carteiras, setCarteiras] = useState([]);
    const [carteiraAtiva, setCarteiraAtiva] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [modal, setModal] = useState(null); // null | { carteira: obj | null }

    const membrosApi = useWalletMembers(carteiraAtiva?.id);
    const recarregarMembros = useRef(membrosApi.recarregar);
    useEffect(() => {
        recarregarMembros.current = membrosApi.recarregar;
    }, [membrosApi.recarregar]);

    const ehDono = (c) => !!c && c.dono?.id === usuarioLogado?.id;

    const carregarCarteiras = async (selecionarId) => {
        setErro("");
        try {
            const resp = await carteiraService.buscarTodos();
            const lista = resp.data || [];
            setCarteiras(lista);
            setCarteiraAtiva((atual) => {
                const alvoId = selecionarId ?? atual?.id;
                return lista.find((c) => c.id === alvoId) || lista[0] || null;
            });
        } catch (err) {
            console.error("Erro ao listar carteiras:", err);
            setErro("Não foi possível carregar suas carteiras.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarCarteiras();
        const token = usuarioLogado?.token || localStorage.getItem("token_usuario");
        const encerrar = conectarEventosSse(token, {
            onCarteiraAlterada: () => {
                carregarCarteiras();
                recarregarMembros.current?.();
            },
        });
        return () => encerrar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuarioLogado?.token]);

    const salvarCarteira = async ({ nome, descricao }) => {
        const editando = modal?.carteira;
        if (editando) {
            await carteiraService.atualizar(editando.id, { nome, descricao });
            await carregarCarteiras(editando.id);
            toast.success("Carteira atualizada.");
        } else {
            const resp = await carteiraService.inserir({ nome, descricao });
            await carregarCarteiras(resp.data?.id);
            toast.success("Carteira criada.");
        }
        setModal(null);
    };

    if (carregando) return <LoadingState label="Carregando carteiras..." />;

    return (
        <>
            <PageHeader
                title="Carteiras"
                subtitle="Crie carteiras e defina quem pode ver ou lançar nelas."
                actions={
                    <Button onClick={() => setModal({ carteira: null })}>
                        <Plus className="icon" aria-hidden="true" /> Nova carteira
                    </Button>
                }
            />

            {erro && <div className="mb"><Alert>{erro}</Alert></div>}

            {carteiras.length === 0 && !erro ? (
                <Card>
                    <EmptyState
                        icon={Wallet}
                        title="Nenhuma carteira ainda"
                        action={<Button onClick={() => setModal({ carteira: null })}>Criar a primeira</Button>}
                    >
                        Crie uma para começar a registrar receitas e despesas.
                    </EmptyState>
                </Card>
            ) : (
                <div className="split">
                    <div className="pick-list" role="group" aria-label="Suas carteiras">
                        {carteiras.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                className="pick"
                                aria-pressed={carteiraAtiva?.id === c.id}
                                onClick={() => setCarteiraAtiva(c)}
                            >
                                <span style={{ minWidth: 0 }}>
                                    <span className="pick__name truncate" style={{ display: "block" }}>{c.nome}</span>
                                    <span className="muted small truncate" style={{ display: "block" }}>
                                        {c.descricao || "Sem descrição"}
                                    </span>
                                </span>
                                <Badge tone={ehDono(c) ? "warning" : "info"}>{ehDono(c) ? "Sua" : "Compartilhada"}</Badge>
                            </button>
                        ))}
                    </div>

                    {carteiraAtiva && (
                        <Card>
                            <CardHeader
                                title={carteiraAtiva.nome}
                                subtitle={`Dona(o): ${nomeDoUsuario(carteiraAtiva.dono)}`}
                                actions={
                                    ehDono(carteiraAtiva) && (
                                        <Button variant="secondary" size="sm" onClick={() => setModal({ carteira: carteiraAtiva })}>
                                            <Pencil className="icon icon--sm" aria-hidden="true" /> Editar
                                        </Button>
                                    )
                                }
                            />
                            {!ehDono(carteiraAtiva) && (
                                <Alert tone="info">
                                    Só quem criou a carteira pode convidar pessoas ou mudar permissões.
                                </Alert>
                            )}
                            <div style={{ marginTop: "var(--s-4)" }}>
                                <MembersPanel api={membrosApi} ehDono={ehDono(carteiraAtiva)} />
                            </div>
                        </Card>
                    )}
                </div>
            )}

            <WalletFormModal
                open={!!modal}
                onClose={() => setModal(null)}
                carteira={modal?.carteira}
                onSubmit={salvarCarteira}
            />
        </>
    );
};

export default Carteiras;
