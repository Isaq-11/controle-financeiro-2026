import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Wallet, Receipt } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import CarteiraService from "@/services/CarteiraService";
import TransacaoService from "@/services/TransacaoService";
import CategoriaService from "@/services/CategoriaService";
import { useAuth } from "@/services/AuthContext";
import { conectarEventosSse } from "@/services/SseService";
import AiInsightsCard from "@/components/AiInsightsCard";
import WalletSwitcher from "@/components/WalletSwitcher";
import LiveIndicator from "@/components/LiveIndicator";
import TransactionLedger from "@/components/TransactionLedger";
import TransactionFormModal from "@/components/TransactionFormModal";
import ChartTooltip, { CORES_GRAFICO } from "@/components/charts/ChartTooltip";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { BalanceHero } from "@/components/ui/stat";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useToast, useConfirm } from "@/components/ui/feedback-provider";
import { dataLocalISO, formatarCompacto, mensagemDeErro, rotuloMes } from "@/lib/format";

const carteiraService = new CarteiraService();
const transacaoService = new TransacaoService();
const categoriaService = new CategoriaService();

const LIMITE_RECENTES = 10;

const Dashboard = () => {
    const { usuarioLogado } = useAuth();
    const toast = useToast();
    const confirmar = useConfirm();

    const [carregando, setCarregando] = useState(true);
    const [erroGeral, setErroGeral] = useState("");
    const [carteiras, setCarteiras] = useState([]);
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [resumo, setResumo] = useState({ saldoAtual: 0, totalReceitas: 0, totalDespesas: 0 });
    const [grafico, setGrafico] = useState([]);
    const [lancamentos, setLancamentos] = useState([]);
    const [conectadoSse, setConectadoSse] = useState(false);

    const [modalAberto, setModalAberto] = useState(false);
    const [transacaoEditando, setTransacaoEditando] = useState(null);

    const carteiraSelecionadaRef = useRef(null);
    useEffect(() => {
        carteiraSelecionadaRef.current = carteiraSelecionada;
    }, [carteiraSelecionada]);

    useEffect(() => {
        carregarDados();

        const token = usuarioLogado?.token || localStorage.getItem("token_usuario");
        const encerrarSse = conectarEventosSse(token, {
            onStatus: setConectadoSse,
            onTransacaoAlterada: (dados) => {
                const atual = carteiraSelecionadaRef.current;
                if (atual && Number(dados.carteiraId) === Number(atual.id)) carregarDadosCarteira(atual.id);

                const acao = dados.acao === "CRIADA" ? "adicionado" : dados.acao === "ATUALIZADA" ? "atualizado" : "removido";
                const autor = dados.autorNome ? ` por ${dados.autorNome}` : "";
                toast.info(`Lançamento ${acao}${autor}: ${dados.descricao || "sem descrição"}`);
            },
            onCarteiraAlterada: () => {
                carregarDados(carteiraSelecionadaRef.current?.id);
                toast.info("Carteira atualizada.");
            },
        });
        return () => encerrarSse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuarioLogado?.token]);

    const carregarDados = async (manterCarteiraId = null) => {
        setCarregando(true);
        setErroGeral("");
        try {
            const [respCarteiras, respCats] = await Promise.all([
                carteiraService.buscarTodos(),
                categoriaService.buscarTodos().catch(() => ({ data: [] })),
            ]);

            const lista = respCarteiras.data || [];
            setCarteiras(lista);
            setCategorias(respCats?.data || []);

            if (lista.length > 0) {
                const alvo = lista.find((c) => c.id === manterCarteiraId) || lista[0];
                setCarteiraSelecionada(alvo);
                await carregarDadosCarteira(alvo.id);
            } else {
                setCarteiraSelecionada(null);
                setLancamentos([]);
                setGrafico([]);
                setResumo({ saldoAtual: 0, totalReceitas: 0, totalDespesas: 0 });
            }
        } catch (error) {
            console.error("Erro ao carregar carteiras:", error);
            setErroGeral("Não foi possível carregar suas finanças. Verifique se o servidor está no ar e tente de novo.");
        } finally {
            setCarregando(false);
        }
    };

    const carregarDadosCarteira = async (walletId) => {
        try {
            const [resumoApi, transacoesApi] = await Promise.all([
                carteiraService.obterResumo(walletId).catch(() => null),
                transacaoService.listarTransacoes(walletId).catch(() => ({ content: [] })),
            ]);

            if (resumoApi) {
                setResumo({
                    saldoAtual: resumoApi.balance ?? resumoApi.saldoAtual ?? 0,
                    totalReceitas: resumoApi.totalIncome ?? resumoApi.totalReceitas ?? 0,
                    totalDespesas: resumoApi.totalExpense ?? resumoApi.totalDespesas ?? 0,
                });
                setGrafico(
                    Array.isArray(resumoApi.byMonth) && resumoApi.byMonth.length > 0
                        ? resumoApi.byMonth.map((m) => ({
                            periodo: rotuloMes(m.month),
                            receitas: Number(m.income || 0),
                            despesas: Number(m.expense || 0),
                        }))
                        : []
                );
            }

            const conteudo = transacoesApi?.content || transacoesApi || [];
            setLancamentos(Array.isArray(conteudo) ? conteudo : []);

            try {
                const cats = await categoriaService.listarPorCarteira(walletId);
                setCategorias(Array.isArray(cats) ? cats : []);
            } catch {
                /* mantém as categorias já carregadas */
            }
        } catch (err) {
            console.error("Erro ao carregar dados da carteira:", err);
        }
    };

    const trocarCarteira = async (id) => {
        const achada = carteiras.find((c) => c.id === id);
        if (!achada) return;
        setCarteiraSelecionada(achada);
        await carregarDadosCarteira(achada.id);
    };

    const abrirNovo = () => {
        setTransacaoEditando(null);
        setModalAberto(true);
    };

    const abrirEdicao = (t) => {
        setTransacaoEditando(t);
        setModalAberto(true);
    };

    const salvarTransacao = async ({ descricao, valor, tipo, categoriaId }) => {
        const dto = { descricao, valor, tipo, data: transacaoEditando?.data || dataLocalISO() };
        if (transacaoEditando) {
            await transacaoService.atualizarTransacao(carteiraSelecionada.id, transacaoEditando.id, categoriaId, dto);
        } else {
            await transacaoService.criarTransacao(carteiraSelecionada.id, categoriaId, dto);
        }
        await carregarDadosCarteira(carteiraSelecionada.id);
        setModalAberto(false);
        toast.success(transacaoEditando ? "Lançamento atualizado." : "Lançamento adicionado.");
    };

    const excluirTransacao = async (t) => {
        const ok = await confirmar({
            titulo: "Excluir lançamento",
            mensagem: `"${t.descricao}" será removido desta carteira.`,
            confirmar: "Excluir",
            perigo: true,
        });
        if (!ok) return;
        try {
            await transacaoService.excluirTransacao(carteiraSelecionada.id, t.id);
            await carregarDadosCarteira(carteiraSelecionada.id);
            toast.success("Lançamento excluído.");
        } catch (err) {
            toast.error(mensagemDeErro(err, "Não foi possível excluir o lançamento."));
        }
    };

    if (carregando) return <LoadingState label="Carregando suas finanças..." />;

    if (erroGeral) {
        return (
            <>
                <PageHeader title="Painel" />
                <Alert action={<Button variant="secondary" size="sm" onClick={() => carregarDados()}>Tentar de novo</Button>}>
                    {erroGeral}
                </Alert>
            </>
        );
    }

    if (!carteiraSelecionada) {
        return (
            <>
                <PageHeader title="Painel" />
                <Card>
                    <EmptyState
                        icon={Wallet}
                        title="Você ainda não tem uma carteira"
                        action={<Link to="/carteiras" className={buttonClass()}>Criar carteira</Link>}
                    >
                        Uma carteira reúne seus lançamentos e pode ser compartilhada com outras pessoas.
                    </EmptyState>
                </Card>
            </>
        );
    }

    const recentes = lancamentos.slice(0, LIMITE_RECENTES);

    return (
        <div className="stack stack--lg">
            <PageHeader
                title="Painel"
                actions={
                    <>
                        <Link to="/carteiras" className={buttonClass({ variant: "secondary" })}>
                            Gerenciar carteiras
                        </Link>
                        <Button onClick={abrirNovo}>
                            <Plus className="icon" aria-hidden="true" /> Novo lançamento
                        </Button>
                    </>
                }
            >
                <div className="cluster" style={{ marginTop: "var(--s-3)", gap: "var(--s-4)" }}>
                    <WalletSwitcher
                        carteiras={carteiras}
                        valor={carteiraSelecionada.id}
                        onChange={trocarCarteira}
                        usuarioId={usuarioLogado?.id}
                    />
                    <LiveIndicator conectado={conectadoSse} />
                </div>
            </PageHeader>

            <Card>
                <BalanceHero saldo={resumo.saldoAtual} receitas={resumo.totalReceitas} despesas={resumo.totalDespesas} />
            </Card>

            <Card>
                <CardHeader title="Fluxo mensal" subtitle="Receitas e despesas por mês nesta carteira" />
                {grafico.length === 0 ? (
                    <EmptyState title="Sem histórico ainda">Os gráficos aparecem assim que houver lançamentos.</EmptyState>
                ) : (
                    <div className="chart" role="img" aria-label="Gráfico de receitas e despesas por mês">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={grafico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke={CORES_GRAFICO.grade} />
                                <XAxis dataKey="periodo" tick={CORES_GRAFICO.eixo} tickLine={false} axisLine={false} />
                                <YAxis tick={CORES_GRAFICO.eixo} tickLine={false} axisLine={false} width={48} tickFormatter={formatarCompacto} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="receitas" name="Receitas" stroke={CORES_GRAFICO.receita} fill={CORES_GRAFICO.receita} fillOpacity={0.12} strokeWidth={2} />
                                <Area type="monotone" dataKey="despesas" name="Despesas" stroke={CORES_GRAFICO.despesa} fill={CORES_GRAFICO.despesa} fillOpacity={0.12} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>

            <AiInsightsCard walletId={carteiraSelecionada.id} />

            <Card flush>
                <CardHeader
                    title="Últimos lançamentos"
                    actions={
                        lancamentos.length > LIMITE_RECENTES && (
                            <Link to="/relatorios" className={buttonClass({ variant: "ghost", size: "sm" })}>
                                Ver extrato completo
                            </Link>
                        )
                    }
                />
                {recentes.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="Nenhum lançamento nesta carteira"
                        action={<Button onClick={abrirNovo}>Adicionar o primeiro</Button>}
                    >
                        Registre uma receita ou despesa para começar.
                    </EmptyState>
                ) : (
                    <TransactionLedger
                        itens={recentes}
                        usuarioId={usuarioLogado?.id}
                        onEditar={abrirEdicao}
                        onExcluir={excluirTransacao}
                    />
                )}
            </Card>

            <TransactionFormModal
                open={modalAberto}
                onClose={() => setModalAberto(false)}
                transacao={transacaoEditando}
                categorias={categorias}
                onSubmit={salvarTransacao}
            />
        </div>
    );
};

export default Dashboard;
