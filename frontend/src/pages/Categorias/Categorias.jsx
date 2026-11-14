import { useState, useEffect, useRef } from "react";
import { Lock, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import CarteiraService from "@/services/CarteiraService";
import CategoriaService from "@/services/CategoriaService";
import { useAuth } from "@/services/AuthContext";
import { conectarEventosSse } from "@/services/SseService";
import WalletSwitcher from "@/components/WalletSwitcher";
import CategoryIcon from "@/components/CategoryIcon";
import CategoryFormModal from "@/components/CategoryFormModal";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useToast, useConfirm } from "@/components/ui/feedback-provider";
import { mensagemDeErro } from "@/lib/format";

const carteiraService = new CarteiraService();
const categoriaService = new CategoriaService();

const Categorias = () => {
    const { usuarioLogado } = useAuth();
    const toast = useToast();
    const confirmar = useConfirm();

    const [carteiras, setCarteiras] = useState([]);
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState("TODOS");
    const [erro, setErro] = useState("");
    const [modal, setModal] = useState(null); // null | { categoria: obj | null }

    const ehDono = carteiraSelecionada?.dono?.id === usuarioLogado?.id;

    const selecionadaRef = useRef(null);
    useEffect(() => {
        selecionadaRef.current = carteiraSelecionada;
    }, [carteiraSelecionada]);

    const carregarCategorias = async (walletId) => {
        try {
            const dados = await categoriaService.listarPorCarteira(walletId);
            setCategorias(Array.isArray(dados) ? dados : []);
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
            setErro("Não foi possível carregar as categorias desta carteira.");
        }
    };

    const carregarCarteiras = async () => {
        setErro("");
        try {
            const resp = await carteiraService.buscarTodos();
            const lista = resp.data || [];
            setCarteiras(lista);
            if (lista.length > 0) {
                const ativa = lista.find((c) => c.id === selecionadaRef.current?.id) || lista[0];
                setCarteiraSelecionada(ativa);
                await carregarCategorias(ativa.id);
            } else {
                setCarteiraSelecionada(null);
                setCategorias([]);
            }
        } catch (err) {
            console.error("Erro ao listar carteiras:", err);
            setErro("Não foi possível carregar suas carteiras.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarCarteiras();
        const token = usuarioLogado?.token || sessionStorage.getItem("token_usuario") || localStorage.getItem("token_usuario");
        const encerrar = conectarEventosSse(token, {
            onCarteiraAlterada: (dados) => {
                const atual = selecionadaRef.current;
                if (atual && Number(dados.carteiraId) === Number(atual.id)) carregarCategorias(atual.id);
            },
        });
        return () => encerrar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuarioLogado?.token]);

    const trocarCarteira = async (id) => {
        const alvo = carteiras.find((c) => c.id === id);
        if (!alvo) return;
        setCarteiraSelecionada(alvo);
        setErro("");
        await carregarCategorias(alvo.id);
    };

    const salvarCategoria = async (payload) => {
        const editando = modal?.categoria;
        if (editando) await categoriaService.atualizar(editando.id, payload);
        else await categoriaService.criarParaCarteira(carteiraSelecionada.id, payload);
        setModal(null);
        await carregarCategorias(carteiraSelecionada.id);
        toast.success(editando ? "Categoria atualizada." : "Categoria criada.");
    };

    const excluirCategoria = async (cat) => {
        const ok = await confirmar({
            titulo: "Excluir categoria",
            mensagem: `"${cat.nome}" será removida desta carteira.`,
            confirmar: "Excluir",
            perigo: true,
        });
        if (!ok) return;
        try {
            await categoriaService.excluir(cat.id);
            await carregarCategorias(carteiraSelecionada.id);
            toast.success("Categoria excluída.");
        } catch (err) {
            toast.error(mensagemDeErro(err, "Não foi possível excluir. Verifique se há lançamentos usando esta categoria."));
        }
    };

    const exibidas = categorias.filter((c) => filtroTipo === "TODOS" || c.tipo === filtroTipo);
    const totalReceitas = categorias.filter((c) => c.tipo === "RECEITA").length;
    const totalDespesas = categorias.filter((c) => c.tipo === "DESPESA").length;

    const filtros = [
        { value: "TODOS", label: `Todas (${categorias.length})` },
        { value: "RECEITA", label: `Receitas (${totalReceitas})` },
        { value: "DESPESA", label: `Despesas (${totalDespesas})` },
    ];

    if (carregando) return <LoadingState label="Carregando categorias..." />;

    return (
        <>
            <PageHeader
                title="Categorias"
                subtitle="Cada carteira tem as suas. Só quem criou a carteira pode criar, editar ou excluir."
                actions={
                    carteiraSelecionada &&
                    ehDono && (
                        <Button onClick={() => setModal({ categoria: null })}>
                            <Plus className="icon" aria-hidden="true" /> Nova categoria
                        </Button>
                    )
                }
            />

            {erro && <div className="mb"><Alert>{erro}</Alert></div>}

            {carteiras.length === 0 ? (
                <Card>
                    <EmptyState title="Nenhuma carteira encontrada">Crie uma carteira para começar a organizar categorias.</EmptyState>
                </Card>
            ) : (
                <div className="stack stack--lg">
                    <div className="cluster cluster--between">
                        <div className="cluster" style={{ gap: "var(--s-3)" }}>
                            <WalletSwitcher
                                carteiras={carteiras}
                                valor={carteiraSelecionada?.id}
                                onChange={trocarCarteira}
                                usuarioId={usuarioLogado?.id}
                            />
                            {!ehDono && <Badge icon={Lock}>Somente leitura</Badge>}
                        </div>
                        <Segmented label="Filtrar por tipo" options={filtros} value={filtroTipo} onChange={setFiltroTipo} />
                    </div>

                    {exibidas.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={Tag}
                                title={categorias.length === 0 ? "Nenhuma categoria nesta carteira" : "Nada neste filtro"}
                                action={ehDono && categorias.length === 0 && (
                                    <Button onClick={() => setModal({ categoria: null })}>Criar a primeira</Button>
                                )}
                            >
                                {categorias.length === 0
                                    ? "Categorias ajudam a entender para onde vai o dinheiro."
                                    : "Troque o filtro para ver as outras categorias."}
                            </EmptyState>
                        </Card>
                    ) : (
                        <ul className="cat-grid">
                            {exibidas.map((cat) => {
                                const receita = cat.tipo === "RECEITA";
                                return (
                                    <li key={cat.id} className="cat">
                                        <div className="cat__who">
                                            <span className="cat__icon" style={{ "--cat": cat.cor || (receita ? "#10B981" : "#EF4444") }}>
                                                <CategoryIcon id={cat.icone} />
                                            </span>
                                            <div style={{ minWidth: 0 }}>
                                                <p className="truncate" style={{ fontWeight: 600 }}>{cat.nome}</p>
                                                <Badge tone={receita ? "income" : "expense"}>{receita ? "Receita" : "Despesa"}</Badge>
                                            </div>
                                        </div>
                                        {ehDono && (
                                            <div className="cluster" style={{ gap: 2, flexWrap: "nowrap" }}>
                                                <Button variant="ghost" size="sm" icon aria-label={`Editar ${cat.nome}`} onClick={() => setModal({ categoria: cat })}>
                                                    <Pencil className="icon icon--sm" />
                                                </Button>
                                                <Button variant="danger" size="sm" icon aria-label={`Excluir ${cat.nome}`} onClick={() => excluirCategoria(cat)}>
                                                    <Trash2 className="icon icon--sm" />
                                                </Button>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            <CategoryFormModal
                open={!!modal}
                onClose={() => setModal(null)}
                categoria={modal?.categoria}
                carteiraNome={carteiraSelecionada?.nome}
                onSubmit={salvarCategoria}
            />
        </>
    );
};

export default Categorias;
