import { useState, useEffect, useMemo } from "react";
import { Download, Printer, Search, SlidersHorizontal, FileSpreadsheet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import CarteiraService from "@/services/CarteiraService";
import TransacaoService from "@/services/TransacaoService";
import CategoriaService from "@/services/CategoriaService";
import { useAuth } from "@/services/AuthContext";
import AiInsightsCard from "@/components/AiInsightsCard";
import WalletSwitcher from "@/components/WalletSwitcher";
import TransactionLedger from "@/components/TransactionLedger";
import ChartTooltip, { CORES_GRAFICO, PALETA_CATEGORIAS } from "@/components/charts/ChartTooltip";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Segmented } from "@/components/ui/segmented";
import { TextField, SelectField } from "@/components/ui/field";
import { Stat } from "@/components/ui/stat";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/feedback-provider";
import { dataLocalISO, formatarCompacto, formatarData, formatarDinheiro, inicial, rotuloMes } from "@/lib/format";

const carteiraService = new CarteiraService();
const transacaoService = new TransacaoService();
const categoriaService = new CategoriaService();

const PERIODOS = [
    { value: "MES_ATUAL", label: "Este mês" },
    { value: "MES_ANTERIOR", label: "Mês passado" },
    { value: "ULTIMOS_3_MESES", label: "3 meses" },
    { value: "ANO_ATUAL", label: "Este ano" },
];

const intervaloDoPreset = (preset) => {
    const hoje = new Date();
    const a = hoje.getFullYear();
    const m = hoje.getMonth();
    const faixas = {
        MES_ATUAL: [new Date(a, m, 1), new Date(a, m + 1, 0)],
        MES_ANTERIOR: [new Date(a, m - 1, 1), new Date(a, m, 0)],
        ULTIMOS_3_MESES: [new Date(a, m - 2, 1), new Date(a, m + 1, 0)],
        ANO_ATUAL: [new Date(a, 0, 1), new Date(a, 11, 31)],
    };
    const faixa = faixas[preset];
    return faixa ? [dataLocalISO(faixa[0]), dataLocalISO(faixa[1])] : null;
};

const Relatorios = () => {
    const { usuarioLogado } = useAuth();
    const toast = useToast();

    const [carteiras, setCarteiras] = useState([]);
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [membros, setMembros] = useState([]);

    const [preset, setPreset] = useState("MES_ATUAL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroMembro, setFiltroMembro] = useState("");
    const [busca, setBusca] = useState("");
    const [filtrosAbertos, setFiltrosAbertos] = useState(false);

    const [relatorio, setRelatorio] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const aplicarPreset = (p) => {
        setPreset(p);
        const faixa = intervaloDoPreset(p);
        if (faixa) {
            setStartDate(faixa[0]);
            setEndDate(faixa[1]);
        }
    };

    useEffect(() => {
        aplicarPreset("MES_ATUAL");
        (async () => {
            try {
                const resp = await carteiraService.buscarTodos();
                const lista = resp.data || [];
                setCarteiras(lista);
                if (lista.length > 0) setCarteiraSelecionada(lista[0]);
                else setCarregando(false);
            } catch (err) {
                console.error("Erro ao carregar carteiras:", err);
                setErro("Não foi possível carregar suas carteiras.");
                setCarregando(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!carteiraSelecionada || !startDate || !endDate) return;
        buscarRelatorio();
        carregarMetadados(carteiraSelecionada.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [carteiraSelecionada?.id, startDate, endDate, filtroTipo, filtroCategoria, filtroMembro]);

    const carregarMetadados = async (walletId) => {
        const [cats, membs] = await Promise.all([
            categoriaService.listarPorCarteira(walletId).catch(() => []),
            carteiraService.listarMembros(walletId).catch(() => []),
        ]);
        setCategorias(Array.isArray(cats) ? cats : []);
        setMembros(Array.isArray(membs) ? membs : []);
    };

    const buscarRelatorio = async () => {
        setCarregando(true);
        setErro("");
        try {
            const params = { startDate, endDate };
            if (filtroTipo) params.type = filtroTipo;
            if (filtroCategoria) params.categoryId = filtroCategoria;
            if (filtroMembro) params.memberId = filtroMembro;
            setRelatorio(await transacaoService.obterRelatorio(carteiraSelecionada.id, params));
        } catch (err) {
            console.error("Erro ao buscar relatório:", err);
            setErro("Não foi possível gerar o relatório para este período.");
        } finally {
            setCarregando(false);
        }
    };

    const transacoes = useMemo(() => {
        const todas = relatorio?.transacoes || [];
        const termo = busca.trim().toLowerCase();
        if (!termo) return todas;
        return todas.filter((t) =>
            [t.descricao, t.categoria?.nome, t.criadoPor?.name, t.criadoPor?.email].some((v) => v?.toLowerCase().includes(termo))
        );
    }, [relatorio?.transacoes, busca]);

    const dadosCategorias = useMemo(
        () =>
            (relatorio?.porCategoria || []).map((c, i) => ({
                name: c.nome,
                value: Number(c.total || 0),
                color: c.cor || PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length],
                percentual: Number(c.percentual || 0),
            })),
        [relatorio?.porCategoria]
    );

    const dadosMensais = useMemo(
        () =>
            (relatorio?.porMes || []).map((m) => ({
                mes: rotuloMes(m?.mes),
                receitas: Number(m?.receitas || 0),
                despesas: Number(m?.despesas || 0),
            })),
        [relatorio?.porMes]
    );

    const exportarCsv = () => {
        if (!transacoes.length) {
            toast.error("Não há lançamentos para exportar neste período.");
            return;
        }
        const aspas = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const num = (v) => Number(v || 0).toFixed(2).replace(".", ",");
        const linhas = transacoes.map((t) =>
            [
                formatarData(t.data),
                t.descricao,
                t.categoria?.nome || "Sem categoria",
                t.tipo === "RECEITA" ? "Receita" : "Despesa",
                t.criadoPor?.name || t.criadoPor?.email || "Membro",
                num(t.valor),
            ].map(aspas).join(";")
        );
        const conteudo = [
            ["Data", "Descrição", "Categoria", "Tipo", "Responsável", "Valor (R$)"].map(aspas).join(";"),
            ...linhas,
            "",
            ["Total receitas", num(relatorio?.totalReceitas)].map(aspas).join(";"),
            ["Total despesas", num(relatorio?.totalDespesas)].map(aspas).join(";"),
            ["Saldo líquido", num(relatorio?.saldoLiquido)].map(aspas).join(";"),
            ["Período", relatorio?.periodoDescricao || ""].map(aspas).join(";"),
        ].join("\r\n");

        // BOM UTF-8 para o Excel brasileiro acertar os acentos.
        const url = URL.createObjectURL(new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `extrato_${carteiraSelecionada?.nome.replace(/\s+/g, "_")}_${startDate}_${endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const filtrosAtivos = [filtroTipo, filtroCategoria, filtroMembro].filter(Boolean).length;
    const saldoNegativo = Number(relatorio?.saldoLiquido || 0) < 0;

    if (!carregando && carteiras.length === 0 && !erro) {
        return (
            <>
                <PageHeader title="Relatórios" />
                <Card>
                    <EmptyState title="Nenhuma carteira encontrada">Crie uma carteira e registre lançamentos para gerar relatórios.</EmptyState>
                </Card>
            </>
        );
    }

    return (
        <div className="stack stack--lg">
            <div className="no-print">
                <PageHeader
                    title="Relatórios"
                    subtitle="Resumo do período, gráficos e extrato para exportar ou imprimir."
                    actions={
                        <>
                            <Button variant="secondary" onClick={exportarCsv}>
                                <Download className="icon" aria-hidden="true" /> Exportar CSV
                            </Button>
                            <Button onClick={() => window.print()}>
                                <Printer className="icon" aria-hidden="true" /> Imprimir / PDF
                            </Button>
                        </>
                    }
                />
            </div>

            <div className="print-only">
                <h1 style={{ fontSize: "1.5rem" }}>Extrato financeiro</h1>
                <p>
                    {carteiraSelecionada?.nome} · {relatorio?.periodoDescricao} · emitido em {new Date().toLocaleDateString("pt-BR")}
                </p>
            </div>

            <Card className="no-print">
                <div className="cluster cluster--between">
                    <WalletSwitcher
                        carteiras={carteiras}
                        valor={carteiraSelecionada?.id}
                        onChange={(id) => setCarteiraSelecionada(carteiras.find((c) => c.id === id))}
                        usuarioId={usuarioLogado?.id}
                    />
                    <div className="cluster">
                        <Segmented label="Período" options={PERIODOS} value={preset} onChange={aplicarPreset} />
                        <Button
                            variant="secondary"
                            size="sm"
                            aria-expanded={filtrosAbertos}
                            onClick={() => setFiltrosAbertos((v) => !v)}
                        >
                            <SlidersHorizontal className="icon icon--sm" aria-hidden="true" />
                            Filtros{filtrosAtivos > 0 && ` (${filtrosAtivos})`}
                        </Button>
                    </div>
                </div>

                {filtrosAbertos && (
                    <div className="filters">
                        <TextField
                            label="De"
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPreset("CUSTOM");
                            }}
                        />
                        <TextField
                            label="Até"
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPreset("CUSTOM");
                            }}
                        />
                        <SelectField label="Tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="RECEITA">Receitas</option>
                            <option value="DESPESA">Despesas</option>
                        </SelectField>
                        <SelectField label="Categoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                            <option value="">Todas</option>
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </SelectField>
                        <SelectField label="Responsável" value={filtroMembro} onChange={(e) => setFiltroMembro(e.target.value)}>
                            <option value="">Todos</option>
                            {membros.map((m) => (
                                <option key={m.usuario?.id || m.id} value={m.usuario?.id || m.id}>
                                    {m.usuario?.name || m.usuario?.email || "Membro"}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                )}
            </Card>

            {erro && <Alert>{erro}</Alert>}

            {carregando && !relatorio ? (
                <LoadingState label="Gerando relatório..." />
            ) : (
                <>
                    <Card style={{ opacity: carregando ? 0.6 : 1 }} aria-busy={carregando}>
                        <div className="stats">
                            <Stat label="Receitas" value={formatarDinheiro(relatorio?.totalReceitas)} tone="income" />
                            <Stat label="Despesas" value={formatarDinheiro(relatorio?.totalDespesas)} tone="expense" />
                            <Stat label="Saldo do período" value={formatarDinheiro(relatorio?.saldoLiquido)} tone={saldoNegativo ? "expense" : "income"} />
                            <Stat
                                label="Taxa de poupança"
                                value={`${Number(relatorio?.taxaPoupanca || 0).toFixed(1)}%`}
                                note={`Média de ${formatarDinheiro(relatorio?.mediaGastoDiario)} por dia`}
                            />
                        </div>
                    </Card>

                    <div className="no-print">
                        <AiInsightsCard
                            walletId={carteiraSelecionada?.id}
                            startDate={startDate}
                            endDate={endDate}
                            tituloPeriodo={relatorio?.periodoDescricao}
                        />
                    </div>

                    <div className="stack stack--lg no-print">
                        <Card>
                            <CardHeader title="Gastos por categoria" />
                            {dadosCategorias.length === 0 ? (
                                <EmptyState title="Sem lançamentos categorizados neste período" />
                            ) : (
                                <div className="donut">
                                    <div className="chart" role="img" aria-label="Distribuição de gastos por categoria">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={dadosCategorias} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                                                    {dadosCategorias.map((d, i) => (
                                                        <Cell key={i} fill={d.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<ChartTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <ul className="legend">
                                        {dadosCategorias.map((c) => (
                                            <li key={c.name} className="legend__row">
                                                <span className="cluster" style={{ flexWrap: "nowrap", minWidth: 0 }}>
                                                    <span className="legend__dot" style={{ background: c.color }} />
                                                    <span className="truncate">{c.name}</span>
                                                </span>
                                                <span className="num muted" style={{ whiteSpace: "nowrap" }}>
                                                    {formatarDinheiro(c.value)} · {c.percentual}%
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>

                        <Card>
                            <CardHeader title="Entradas e saídas por mês" />
                            {dadosMensais.length === 0 ? (
                                <EmptyState title="Sem histórico mensal neste período" />
                            ) : (
                                <div className="chart" role="img" aria-label="Comparativo mensal de receitas e despesas">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dadosMensais} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                            <CartesianGrid vertical={false} stroke={CORES_GRAFICO.grade} />
                                            <XAxis dataKey="mes" tick={CORES_GRAFICO.eixo} tickLine={false} axisLine={false} />
                                            <YAxis tick={CORES_GRAFICO.eixo} tickLine={false} axisLine={false} width={48} tickFormatter={formatarCompacto} />
                                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-2)" }} />
                                            <Bar dataKey="receitas" name="Receitas" fill={CORES_GRAFICO.receita} radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="despesas" name="Despesas" fill={CORES_GRAFICO.despesa} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Card>
                    </div>

                    {relatorio?.porMembro?.length > 1 && (
                        <Card className="no-print">
                            <CardHeader title="Por membro" />
                            <ul className="members">
                                {relatorio.porMembro.map((m) => (
                                    <li key={m.usuarioId} className="member">
                                        <div className="member__who">
                                            <span className="avatar">{inicial(m.nome)}</span>
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{m.nome}</p>
                                                <p className="muted small">{m.quantidadeTransacoes} lançamentos</p>
                                            </div>
                                        </div>
                                        <div className="cluster" style={{ gap: "var(--s-5)" }}>
                                            <span className="num is-income">+ {formatarDinheiro(m.totalReceitas)}</span>
                                            <span className="num is-expense">− {formatarDinheiro(m.totalDespesas)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    <Card flush>
                        <CardHeader
                            title="Extrato"
                            subtitle={`${relatorio?.periodoDescricao || ""} · ${transacoes.length} lançamentos`}
                            actions={
                                <div className="input-wrap no-print" style={{ minWidth: "min(100%, 14rem)" }}>
                                    <Search className="icon icon--sm input-wrap__icon" aria-hidden="true" />
                                    <input
                                        className="input input--sm input--with-icon"
                                        type="search"
                                        placeholder="Buscar no extrato"
                                        aria-label="Buscar no extrato"
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                </div>
                            }
                        />
                        {transacoes.length === 0 ? (
                            <EmptyState icon={FileSpreadsheet} title="Nenhum lançamento encontrado">
                                Ajuste o período ou os filtros para ver mais resultados.
                            </EmptyState>
                        ) : (
                            <TransactionLedger
                                itens={transacoes}
                                usuarioId={usuarioLogado?.id}
                                rodape={
                                    <>
                                        <span>Saldo do extrato</span>
                                        <span className={`num ${saldoNegativo ? "is-expense" : "is-income"}`}>
                                            {formatarDinheiro(relatorio?.saldoLiquido)}
                                        </span>
                                    </>
                                }
                            />
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

export default Relatorios;
