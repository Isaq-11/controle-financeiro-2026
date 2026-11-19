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
import { Segmented } from "@/components/ui/segmented";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useToast, useConfirm } from "@/components/ui/feedback-provider";
import { dataLocalISO, formatarCompacto, mensagemDeErro } from "@/lib/format";

const carteiraService = new CarteiraService();
const transacaoService = new TransacaoService();
const categoriaService = new CategoriaService();

const LIMITE_RECENTES = 10;

// Calcula intervalos de datas para os filtros da linha do tempo
const obterDatasDoPeriodo = (tipo) => {
    const hoje = new Date();
    const formatarData = (d) => {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    };

    if (tipo === "quinzenal") {
        // Últimos 15 dias (14 dias atrás até hoje)
        const inicio = new Date(hoje);
        inicio.setDate(hoje.getDate() - 14);
        return {
            startDate: formatarData(inicio),
            endDate: formatarData(hoje),
            rotulo: "Quinzenal (últimos 15 dias)",
        };
    }

    if (tipo === "mensal") {
        // Mês atual completo
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        return {
            startDate: formatarData(inicio),
            endDate: formatarData(fim),
            rotulo: "Mensal (mês atual)",
        };
    }

    if (tipo === "anual") {
        // Ano atual
        const inicio = new Date(hoje.getFullYear(), 0, 1);
        const fim = new Date(hoje.getFullYear(), 11, 31);
        return {
            startDate: formatarData(inicio),
            endDate: formatarData(fim),
            rotulo: `Anual (${hoje.getFullYear()})`,
        };
    }

    return { startDate: null, endDate: null, rotulo: "Geral" };
};

// Gera os pontos do gráfico adequados à escala temporal escolhida
const gerarDadosGrafico = (tipoPeriodo, resumoApi, transacoes) => {
    const hoje = new Date();

    if (tipoPeriodo === "quinzenal") {
        // Gera os 15 dias exatos para mostrar a evolução dia a dia
        const dias = [];
        for (let i = 14; i >= 0; i--) {
            const d = new Date(hoje);
            d.setDate(hoje.getDate() - i);
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const rotulo = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
            dias.push({ iso, periodo: rotulo, receitas: 0, despesas: 0 });
        }

        const mapa = new Map(dias.map((item) => [item.iso, item]));
        transacoes.forEach((t) => {
            const dataStr = t.data ? t.data.slice(0, 10) : "";
            const bucket = mapa.get(dataStr);
            if (bucket) {
                const val = Number(t.valor || 0);
                if (t.tipo === "RECEITA") bucket.receitas += val;
                else if (t.tipo === "DESPESA") bucket.despesas += val;
            }
        });
        return dias;
    }

    if (tipoPeriodo === "mensal") {
        // Gera todos os dias do mês atual
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();
        const ultimoDia = new Date(ano, mes + 1, 0).getDate();
        const diasMes = [];
        for (let d = 1; d <= ultimoDia; d++) {
            const iso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const rotulo = `${String(d).padStart(2, "0")}/${String(mes + 1).padStart(2, "0")}`;
            diasMes.push({ iso, periodo: rotulo, receitas: 0, despesas: 0 });
        }

        const mapa = new Map(diasMes.map((item) => [item.iso, item]));
        transacoes.forEach((t) => {
            const dataStr = t.data ? t.data.slice(0, 10) : "";
            const bucket = mapa.get(dataStr);
            if (bucket) {
                const val = Number(t.valor || 0);
                if (t.tipo === "RECEITA") bucket.receitas += val;
                else if (t.tipo === "DESPESA") bucket.despesas += val;
            }
        });
        return diasMes;
    }

    // Padrão ANUAL: agrupamento por 12 meses
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const meses = mesesNomes.map((nome, idx) => {
        const mesIso = `${hoje.getFullYear()}-${String(idx + 1).padStart(2, "0")}`;
        return { iso: mesIso, periodo: nome, receitas: 0, despesas: 0 };
    });

    const mapaMeses = new Map(meses.map((item) => [item.iso, item]));
    if (Array.isArray(resumoApi?.byMonth) && resumoApi.byMonth.length > 0) {
        resumoApi.byMonth.forEach((m) => {
            const bucket = mapaMeses.get(m.month);
            if (bucket) {
                bucket.receitas = Number(m.income || 0);
                bucket.despesas = Number(m.expense || 0);
            }
        });
    } else {
        transacoes.forEach((t) => {
            if (t.data) {
                const mesIso = t.data.slice(0, 7);
                const bucket = mapaMeses.get(mesIso);
                if (bucket) {
                    const val = Number(t.valor || 0);
                    if (t.tipo === "RECEITA") bucket.receitas += val;
                    else if (t.tipo === "DESPESA") bucket.despesas += val;
                }
            }
        });
    }
    return meses;
};

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

    // Filtro inicial padrão: quinzenal
    const [filtroPeriodo, setFiltroPeriodo] = useState("quinzenal");

    const [modalAberto, setModalAberto] = useState(false);
    const [transacaoEditando, setTransacaoEditando] = useState(null);

    const carteiraSelecionadaRef = useRef(null);
    useEffect(() => {
        carteiraSelecionadaRef.current = carteiraSelecionada;
    }, [carteiraSelecionada]);

    const filtroPeriodoRef = useRef("quinzenal");
    useEffect(() => {
        filtroPeriodoRef.current = filtroPeriodo;
    }, [filtroPeriodo]);

    useEffect(() => {
        carregarDados();

        const token = usuarioLogado?.token || localStorage.getItem("token_usuario");
        const encerrarSse = conectarEventosSse(token, {
            onStatus: setConectadoSse,
            onTransacaoAlterada: (dados) => {
                const atual = carteiraSelecionadaRef.current;
                const ehMesmaCarteira = atual && Number(dados.carteiraId) === Number(atual.id);

                // Se o usuário está observando a carteira que foi alterada, atualiza imediatamente em tempo real
                if (ehMesmaCarteira) {
                    carregarDadosCarteira(atual.id, filtroPeriodoRef.current);
                }

                // Notificação exibida independentemente de qual carteira o membro está vendo
                const acao = dados.acao === "CRIADA" ? "adicionado" : dados.acao === "ATUALIZADA" ? "atualizado" : "removido";
                const autor = dados.autorNome ? ` por ${dados.autorNome}` : "";
                const prefixoCarteira = !ehMesmaCarteira && dados.carteiraNome ? `[${dados.carteiraNome}] ` : "";
                toast.info(`${prefixoCarteira}Lançamento ${acao}${autor}: ${dados.descricao || "sem descrição"}`);
            },
            onCarteiraAlterada: () => {
                carregarDados(carteiraSelecionadaRef.current?.id);
                toast.info("Carteira atualizada em tempo real.");
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
                await carregarDadosCarteira(alvo.id, filtroPeriodoRef.current);
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

    const carregarDadosCarteira = async (walletId, tipoPeriodo = filtroPeriodoRef.current) => {
        try {
            const { startDate, endDate } = obterDatasDoPeriodo(tipoPeriodo);
            const paramsSummary = {};
            if (startDate) paramsSummary.startDate = startDate;
            if (endDate) paramsSummary.endDate = endDate;

            const [resumoApi, transacoesApi] = await Promise.all([
                carteiraService.obterResumo(walletId, paramsSummary).catch(() => null),
                transacaoService.listarTransacoes(walletId, { size: 100 }).catch(() => ({ content: [] })),
            ]);

            const conteudo = transacoesApi?.content || transacoesApi || [];
            const listaTransacoes = Array.isArray(conteudo) ? conteudo : [];
            setLancamentos(listaTransacoes);

            if (resumoApi) {
                setResumo({
                    saldoAtual: resumoApi.balance ?? resumoApi.saldoAtual ?? 0,
                    totalReceitas: resumoApi.totalIncome ?? resumoApi.totalReceitas ?? 0,
                    totalDespesas: resumoApi.totalExpense ?? resumoApi.totalDespesas ?? 0,
                });
            }

            setGrafico(gerarDadosGrafico(tipoPeriodo, resumoApi, listaTransacoes));

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
        await carregarDadosCarteira(achada.id, filtroPeriodo);
    };

    const mudarPeriodo = async (novoPeriodo) => {
        setFiltroPeriodo(novoPeriodo);
        if (carteiraSelecionada?.id) {
            await carregarDadosCarteira(carteiraSelecionada.id, novoPeriodo);
        }
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
        await carregarDadosCarteira(carteiraSelecionada.id, filtroPeriodo);
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
            await carregarDadosCarteira(carteiraSelecionada.id, filtroPeriodo);
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

    const infoPeriodo = obterDatasDoPeriodo(filtroPeriodo);
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
                <CardHeader
                    title="Linha do tempo"
                    subtitle={`Fluxo financeiro (${infoPeriodo.rotulo})`}
                    actions={
                        <Segmented
                            options={[
                                { value: "quinzenal", label: "Quinzenal" },
                                { value: "mensal", label: "Mensal" },
                                { value: "anual", label: "Anual" },
                            ]}
                            value={filtroPeriodo}
                            onChange={mudarPeriodo}
                        />
                    }
                />
                {grafico.length === 0 ? (
                    <EmptyState title="Sem histórico ainda">Os gráficos aparecem assim que houver lançamentos.</EmptyState>
                ) : (
                    <div className="chart" role="img" aria-label="Gráfico de receitas e despesas por período">
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

            <AiInsightsCard
                walletId={carteiraSelecionada.id}
                startDate={infoPeriodo.startDate}
                endDate={infoPeriodo.endDate}
                tituloPeriodo={infoPeriodo.rotulo}
            />

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
