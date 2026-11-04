import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BarChart3,
    FileSpreadsheet,
    Printer,
    Download,
    Calendar,
    Filter,
    PieChart as PieChartIcon,
    TrendingUp,
    TrendingDown,
    Wallet,
    User,
    Tag,
    RefreshCw,
    Percent,
    DollarSign,
    Users,
    Search,
    ChevronDown
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from "recharts";
import CarteiraService from "@/services/CarteiraService";
import TransacaoService from "@/services/TransacaoService";
import CategoriaService from "@/services/CategoriaService";
import { useAuth } from "@/services/AuthContext";
import AiInsightsCard from "@/components/AiInsightsCard";

const carteiraService = new CarteiraService();
const transacaoService = new TransacaoService();
const categoriaService = new CategoriaService();

// Paleta de cores para categorias que não possuem cor definida
const CORES_PADRAO = [
    "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B",
    "#EF4444", "#06B6D4", "#6366F1", "#14B8A6", "#84CC16"
];

const Relatorios = () => {
    const { usuarioLogado } = useAuth();
    const [carteiras, setCarteiras] = useState([]);
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [membros, setMembros] = useState([]);

    // Filtros do Relatório
    const [presetPeriodo, setPresetPeriodo] = useState("MES_ATUAL"); // MES_ATUAL, MES_ANTERIOR, ULTIMOS_3_MESES, ANO_ATUAL, CUSTOM
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filtroTipo, setFiltroTipo] = useState(""); // "", RECEITA, DESPESA
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroMembro, setFiltroMembro] = useState("");
    const [buscaTexto, setBuscaTexto] = useState("");

    // Estado dos Dados do Relatório
    const [relatorio, setRelatorio] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // Inicializa datas com base no preset
    const aplicarPreset = (preset) => {
        setPresetPeriodo(preset);
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();

        const formatarData = (d) => {
            const a = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const dia = String(d.getDate()).padStart(2, "0");
            return `${a}-${m}-${dia}`;
        };

        if (preset === "MES_ATUAL") {
            const inicio = new Date(ano, mes, 1);
            const fim = new Date(ano, mes + 1, 0);
            setStartDate(formatarData(inicio));
            setEndDate(formatarData(fim));
        } else if (preset === "MES_ANTERIOR") {
            const inicio = new Date(ano, mes - 1, 1);
            const fim = new Date(ano, mes, 0);
            setStartDate(formatarData(inicio));
            setEndDate(formatarData(fim));
        } else if (preset === "ULTIMOS_3_MESES") {
            const inicio = new Date(ano, mes - 2, 1);
            const fim = new Date(ano, mes + 1, 0);
            setStartDate(formatarData(inicio));
            setEndDate(formatarData(fim));
        } else if (preset === "ANO_ATUAL") {
            const inicio = new Date(ano, 0, 1);
            const fim = new Date(ano, 11, 31);
            setStartDate(formatarData(inicio));
            setEndDate(formatarData(fim));
        }
    };

    useEffect(() => {
        aplicarPreset("MES_ATUAL");
        carregarCarteirasIniciais();
    }, []);

    useEffect(() => {
        if (carteiraSelecionada && startDate && endDate) {
            buscarRelatorio();
            carregarMetadadosCarteira(carteiraSelecionada.id);
        }
    }, [carteiraSelecionada?.id, startDate, endDate, filtroTipo, filtroCategoria, filtroMembro]);

    const carregarCarteirasIniciais = async () => {
        try {
            const resp = await carteiraService.buscarTodos();
            const lista = resp.data || [];
            setCarteiras(lista);
            if (lista.length > 0) {
                setCarteiraSelecionada(lista[0]);
            }
        } catch (err) {
            console.error("Erro ao carregar carteiras:", err);
            setErro("Não foi possível carregar suas carteiras.");
        }
    };

    const carregarMetadadosCarteira = async (walletId) => {
        try {
            const [cats, membs] = await Promise.all([
                categoriaService.listarPorCarteira(walletId).catch(() => []),
                carteiraService.listarMembros(walletId).catch(() => [])
            ]);
            setCategorias(Array.isArray(cats) ? cats : []);
            setMembros(Array.isArray(membs) ? membs : []);
        } catch (e) {
            console.error("Erro ao carregar metadados da carteira:", e);
        }
    };

    const buscarRelatorio = async () => {
        if (!carteiraSelecionada) return;
        setCarregando(true);
        setErro("");

        try {
            const params = {
                startDate,
                endDate
            };
            if (filtroTipo) params.type = filtroTipo;
            if (filtroCategoria) params.categoryId = filtroCategoria;
            if (filtroMembro) params.memberId = filtroMembro;

            const dados = await transacaoService.obterRelatorio(carteiraSelecionada.id, params);
            setRelatorio(dados);
        } catch (err) {
            console.error("Erro ao buscar relatório financeiro:", err);
            setErro("Não foi possível gerar o relatório para o período selecionado.");
        } finally {
            setCarregando(false);
        }
    };

    // Formatação de valores em Real
    const formatarDinheiro = (val) => {
        return "R$ " + Number(val || 0).toFixed(2).replace(".", ",");
    };

    // Formatação amigável de data
    const formatarData = (dataStr) => {
        if (!dataStr) return "-";
        const partes = String(dataStr).split("T")[0].split("-");
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return new Date(dataStr).toLocaleDateString("pt-BR");
    };

    // Filtro de busca local na tabela de extrato
    const transacoesFiltradas = useMemo(() => {
        if (!relatorio?.transacoes) return [];
        if (!buscaTexto.trim()) return relatorio.transacoes;
        const termo = buscaTexto.toLowerCase();
        return relatorio.transacoes.filter(t =>
            (t.descricao && t.descricao.toLowerCase().includes(termo)) ||
            (t.categoria?.nome && t.categoria.nome.toLowerCase().includes(termo)) ||
            (t.criadoPor?.name && t.criadoPor.name.toLowerCase().includes(termo)) ||
            (t.criadoPor?.email && t.criadoPor.email.toLowerCase().includes(termo))
        );
    }, [relatorio?.transacoes, buscaTexto]);

    // Dados para o Gráfico de Categorias (PieChart)
    const dadosGraficoCategorias = useMemo(() => {
        if (!relatorio?.porCategoria) return [];
        return relatorio.porCategoria.map((c, index) => ({
            name: c.nome,
            value: Number(c.total || 0),
            color: c.cor || CORES_PADRAO[index % CORES_PADRAO.length],
            tipo: c.tipo,
            percentual: Number(c.percentual || 0)
        }));
    }, [relatorio?.porCategoria]);

    // Dados para o Gráfico de Evolução Mensal (BarChart)
    const dadosGraficoMensal = useMemo(() => {
        if (!relatorio?.porMes) return [];
        return relatorio.porMes.map(m => {
            if (!m || !m.mes || typeof m.mes !== "string") return { mes: "Outros", receitas: 0, despesas: 0, saldo: 0 };
            const partes = m.mes.split("-");
            const ano = partes[0] || "";
            const mes = partes[1] || "";
            const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            const nomeFormatado = `${mesesNomes[parseInt(mes, 10) - 1] || mes}/${ano}`;
            return {
                mes: nomeFormatado,
                receitas: Number(m.receitas || 0),
                despesas: Number(m.despesas || 0),
                saldo: Number(m.saldo || 0)
            };
        });
    }, [relatorio?.porMes]);

    // Exportar para CSV / Excel com UTF-8 BOM
    const handleExportarCsv = () => {
        if (!transacoesFiltradas.length) {
            alert("Não há dados no relatório para exportar.");
            return;
        }

        const cabecalho = ["Data", "Descricao", "Categoria", "Tipo", "Responsavel", "Valor (R$)"];
        const linhas = transacoesFiltradas.map(t => [
            `"${formatarData(t.data)}"`,
            `"${(t.descricao || "").replace(/"/g, '""')}"`,
            `"${(t.categoria?.nome || "Geral").replace(/"/g, '""')}"`,
            `"${t.tipo === "RECEITA" ? "Receita" : "Despesa"}"`,
            `"${(t.criadoPor?.name || t.criadoPor?.email || "Membro").replace(/"/g, '""')}"`,
            `"${Number(t.valor || 0).toFixed(2).replace(".", ",")}"`
        ]);

        const conteudoCsv = [
            cabecalho.join(";"),
            ...linhas.map(l => l.join(";")),
            "",
            `"Total Receitas";"${Number(relatorio?.totalReceitas || 0).toFixed(2).replace(".", ",")}"`,
            `"Total Despesas";"${Number(relatorio?.totalDespesas || 0).toFixed(2).replace(".", ",")}"`,
            `"Saldo Liquido";"${Number(relatorio?.saldoLiquido || 0).toFixed(2).replace(".", ",")}"`,
            `"Periodo";"${relatorio?.periodoDescricao || ""}"`
        ].join("\r\n");

        // UTF-8 BOM para garantir acentuação correta no Excel brasileiro
        const blob = new Blob(["\uFEFF" + conteudoCsv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `extrato_${carteiraSelecionada?.nome.replace(/\s+/g, "_")}_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Imprimir / Salvar PDF usando window.print() estilizado
    const handleImprimir = () => {
        window.print();
    };

    return (
        <div className="space-y-6 print:m-0 print:p-0">
            {/* Header da Tela */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-emerald-400" />
                        Relatórios & Extratos Financeiros
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Consolidação de receitas, despesas, extrato de transações e distribuição por categorias e membros.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        onClick={handleExportarCsv}
                        variant="outline"
                        className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                        title="Baixar planilha para Excel (.csv)"
                    >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        Exportar CSV
                    </Button>

                    <Button
                        onClick={handleImprimir}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                        title="Imprimir relatório ou Salvar como PDF"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir / Salvar PDF
                    </Button>
                </div>
            </div>

            {/* Cabeçalho Oficial visível apenas na impressão/PDF */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Controle Financeiro</h1>
                        <p className="text-sm text-slate-600 font-semibold">Relatório e Extrato Consolidado da Carteira</p>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                        <p><strong>Carteira:</strong> {carteiraSelecionada?.nome}</p>
                        <p><strong>Período:</strong> {relatorio?.periodoDescricao}</p>
                        <p><strong>Emitido em:</strong> {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}</p>
                    </div>
                </div>
            </div>

            {/* Painel de Filtros e Seleção (Oculto na Impressão) */}
            <Card className="bg-slate-900 border-slate-800 print:hidden">
                <CardContent className="p-4 space-y-4">
                    {/* Linha 1: Seleção de Carteira e Presets de Período */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-800">
                        {/* Seletor de Carteira */}
                        <div className="flex items-center gap-2 min-w-[240px]">
                            <Wallet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Carteira:</Label>
                            <select
                                value={carteiraSelecionada?.id || ""}
                                onChange={(e) => {
                                    const achada = carteiras.find(c => c.id === Number(e.target.value));
                                    if (achada) setCarteiraSelecionada(achada);
                                }}
                                className="bg-slate-950 border border-slate-700 text-slate-100 text-xs font-bold rounded-lg p-2 flex-1 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                                {carteiras.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome} {c.dono?.id === usuarioLogado?.id ? "(Sua)" : "(Compartilhada)"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Presets Rápidos de Período */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-semibold mr-1">Período:</span>
                            <button
                                type="button"
                                onClick={() => aplicarPreset("MES_ATUAL")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${presetPeriodo === "MES_ATUAL"
                                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                Mês Atual
                            </button>
                            <button
                                type="button"
                                onClick={() => aplicarPreset("MES_ANTERIOR")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${presetPeriodo === "MES_ANTERIOR"
                                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                Mês Anterior
                            </button>
                            <button
                                type="button"
                                onClick={() => aplicarPreset("ULTIMOS_3_MESES")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${presetPeriodo === "ULTIMOS_3_MESES"
                                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                Últimos 3 Meses
                            </button>
                            <button
                                type="button"
                                onClick={() => aplicarPreset("ANO_ATUAL")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${presetPeriodo === "ANO_ATUAL"
                                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                Ano Atual
                            </button>
                        </div>
                    </div>

                    {/* Linha 2: Filtros Detalhados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
                        {/* Data Início */}
                        <div>
                            <Label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3" /> Data Inicial
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPresetPeriodo("CUSTOM");
                                }}
                                className="bg-slate-950 border-slate-700 text-slate-100 text-xs h-9"
                            />
                        </div>

                        {/* Data Fim */}
                        <div>
                            <Label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3" /> Data Final
                            </Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPresetPeriodo("CUSTOM");
                                }}
                                className="bg-slate-950 border-slate-700 text-slate-100 text-xs h-9"
                            />
                        </div>

                        {/* Tipo de Transação */}
                        <div>
                            <Label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Filter className="w-3 h-3" /> Tipo
                            </Label>
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2 h-9"
                            >
                                <option value="">Todos os Tipos</option>
                                <option value="RECEITA">Apenas Receitas (+)</option>
                                <option value="DESPESA">Apenas Despesas (-)</option>
                            </select>
                        </div>

                        {/* Categoria */}
                        <div>
                            <Label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Tag className="w-3 h-3" /> Categoria
                            </Label>
                            <select
                                value={filtroCategoria}
                                onChange={(e) => setFiltroCategoria(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2 h-9"
                            >
                                <option value="">Todas as Categorias</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nome} ({cat.tipo})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Membro Responsável (se houver membros) */}
                        <div>
                            <Label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <User className="w-3 h-3" /> Responsável
                            </Label>
                            <select
                                value={filtroMembro}
                                onChange={(e) => setFiltroMembro(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2 h-9"
                            >
                                <option value="">Todos os Membros</option>
                                {membros.map(m => (
                                    <option key={m.usuario?.id || m.id} value={m.usuario?.id || m.id}>
                                        {m.usuario?.name || m.usuario?.email || "Membro"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Mensagem de Erro */}
            {erro && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-semibold">
                    {erro}
                </div>
            )}

            {/* Indicador de Carregamento */}
            {carregando && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center gap-2 animate-pulse print:hidden">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Atualizando dados e extrato financeiro da carteira...</span>
                </div>
            )}

            {/* Indicadores Principais (KPIs) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                {/* Total Receitas */}
                <Card className="bg-slate-900 border-slate-800 print:bg-white print:border-slate-300">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Total Receitas</p>
                            <h3 className="text-xl font-black text-emerald-400 print:text-emerald-700 mt-1">
                                {formatarDinheiro(relatorio?.totalReceitas)}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-600/50 flex items-center justify-center text-emerald-400 print:hidden">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Total Despesas */}
                <Card className="bg-slate-900 border-slate-800 print:bg-white print:border-slate-300">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Total Despesas</p>
                            <h3 className="text-xl font-black text-rose-400 print:text-rose-700 mt-1">
                                {formatarDinheiro(relatorio?.totalDespesas)}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-600/50 flex items-center justify-center text-rose-400 print:hidden">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Saldo Líquido do Período */}
                <Card className="bg-slate-900 border-slate-800 print:bg-white print:border-slate-300">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Saldo do Período</p>
                            <h3 className={`text-xl font-black mt-1 ${Number(relatorio?.saldoLiquido || 0) >= 0
                                    ? "text-emerald-400 print:text-emerald-700"
                                    : "text-rose-400 print:text-rose-700"
                                }`}>
                                {formatarDinheiro(relatorio?.saldoLiquido)}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 print:hidden">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Taxa de Poupança / Economia */}
                <Card className="bg-slate-900 border-slate-800 print:bg-white print:border-slate-300">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Taxa de Poupança</p>
                            <h3 className="text-xl font-black text-indigo-400 print:text-indigo-700 mt-1">
                                {Number(relatorio?.taxaPoupanca || 0).toFixed(1)}%
                            </h3>
                            <p className="text-[10px] text-slate-400 print:text-slate-600">
                                Média: {formatarDinheiro(relatorio?.mediaGastoDiario)}/dia
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-600/50 flex items-center justify-center text-indigo-400 print:hidden">
                            <Percent className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Diagnóstico e Insights Inteligentes com IA (Google Gemini Gratuito) */}
            <AiInsightsCard
                walletId={carteiraSelecionada?.id}
                startDate={startDate}
                endDate={endDate}
                tituloPeriodo={relatorio?.periodoDescricao}
            />

            {/* Seção Gráfica: Distribuição por Categoria e Evolução Mensal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
                {/* Gráfico 1: Despesas por Categoria (Donut / Pie) */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-emerald-400" />
                            Distribuição de Gastos por Categoria
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dadosGraficoCategorias.length === 0 ? (
                            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
                                Nenhuma transação categorizada no período.
                            </div>
                        ) : (
                            <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="h-60 w-full sm:w-1/2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dadosGraficoCategorias}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {dadosGraficoCategorias.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [formatarDinheiro(value), "Valor"]}
                                                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "12px" }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Lista lateral de categorias com percentuais */}
                                <div className="w-full sm:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                                    {dadosGraficoCategorias.map(cat => (
                                        <div key={cat.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                                <span className="font-semibold text-slate-200 truncate">{cat.name}</span>
                                            </div>
                                            <div className="text-right flex-shrink-0 font-mono">
                                                <span className="text-slate-300 font-bold">{formatarDinheiro(cat.value)}</span>
                                                <span className="text-slate-400 text-[10px] ml-1.5">({cat.percentual}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Gráfico 2: Evolução Mensal (BarChart comparativo) */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            Comparativo Mensal (Entradas vs Saídas)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dadosGraficoMensal.length === 0 ? (
                            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
                                Nenhum histórico mensal para o período selecionado.
                            </div>
                        ) : (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dadosGraficoMensal} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                                        <YAxis stroke="#94a3b8" fontSize={11} />
                                        <Tooltip
                                            formatter={(value) => [formatarDinheiro(value)]}
                                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "12px" }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                                        <Bar dataKey="receitas" name="Receitas (+)" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="despesas" name="Despesas (-)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Se houver membros compartilhados: Divisão por Membro */}
            {relatorio?.porMembro && relatorio.porMembro.length > 1 && (
                <Card className="bg-slate-900 border-slate-800 print:hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" />
                            Movimentação por Membro da Carteira
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {relatorio.porMembro.map(m => (
                                <div key={m.usuarioId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-300 font-bold text-xs">
                                                {m.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-200 text-xs truncate">{m.nome}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                                            {m.quantidadeTransacoes} transações
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                                        <div>
                                            <span className="text-[10px] text-emerald-400 block font-semibold">+ Entradas:</span>
                                            <span className="font-mono text-slate-300">{formatarDinheiro(m.totalReceitas)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-rose-400 block font-semibold">- Saídas:</span>
                                            <span className="font-mono text-slate-300">{formatarDinheiro(m.totalDespesas)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Extrato Detalhado de Transações */}
            <Card className="bg-slate-900 border-slate-800 print:bg-white print:border-none print:shadow-none">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800 print:border-b-2 print:border-slate-900">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-100 print:text-slate-900 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-400 print:text-slate-900" />
                            Extrato Detalhado do Período
                        </CardTitle>
                        <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                            {relatorio?.periodoDescricao} • Total de {transacoesFiltradas.length} transações
                        </p>
                    </div>

                    {/* Barra de Busca rápida (Oculta na impressão) */}
                    <div className="relative w-full sm:w-64 print:hidden">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Buscar no extrato..."
                            value={buscaTexto}
                            onChange={(e) => setBuscaTexto(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-slate-100 text-xs pl-8 h-8"
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-200 print:text-slate-900">
                            <thead className="bg-slate-950 text-slate-400 print:bg-slate-100 print:text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Descrição</th>
                                    <th className="p-3">Categoria</th>
                                    <th className="p-3">Responsável</th>
                                    <th className="p-3 text-center">Tipo</th>
                                    <th className="p-3 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                                {transacoesFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-slate-400 print:text-slate-600">
                                            Nenhum lançamento encontrado para os filtros aplicados.
                                        </td>
                                    </tr>
                                ) : (
                                    transacoesFiltradas.map((t) => {
                                        const ehReceita = t.tipo === "RECEITA";
                                        const autor = t.criadoPor?.name || t.criadoPor?.email || "Membro";

                                        return (
                                            <tr key={t.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                                                <td className="p-3 font-mono text-slate-300 print:text-slate-800 whitespace-nowrap">
                                                    {formatarData(t.data)}
                                                </td>
                                                <td className="p-3 font-semibold text-slate-100 print:text-slate-900">
                                                    {t.descricao}
                                                </td>
                                                <td className="p-3 text-slate-300 print:text-slate-800">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 print:bg-slate-100 border border-slate-700/60 print:border-slate-300">
                                                        <Tag className="w-3 h-3 text-slate-400" />
                                                        {t.categoria?.nome || "Geral"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-300 print:text-slate-800">
                                                    <span className="inline-flex items-center gap-1">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                        {t.criadoPor?.id === usuarioLogado?.id ? "Você" : autor}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center whitespace-nowrap">
                                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${ehReceita
                                                            ? "bg-emerald-950/80 border-emerald-600 text-emerald-300 print:bg-emerald-50 print:text-emerald-800"
                                                            : "bg-rose-950/80 border-rose-600 text-rose-300 print:bg-rose-50 print:text-rose-800"
                                                        }`}>
                                                        {ehReceita ? "+ RECEITA" : "- DESPESA"}
                                                    </span>
                                                </td>
                                                <td className={`p-3 text-right font-mono font-bold whitespace-nowrap ${ehReceita
                                                        ? "text-emerald-400 print:text-emerald-700"
                                                        : "text-rose-400 print:text-rose-700"
                                                    }`}>
                                                    {ehReceita ? "+ " : "- "}
                                                    {formatarDinheiro(t.valor)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                            {/* Rodapé Consolidado */}
                            {transacoesFiltradas.length > 0 && (
                                <tfoot className="bg-slate-950 print:bg-slate-100 font-bold border-t-2 border-slate-700 print:border-slate-800">
                                    <tr>
                                        <td colSpan="5" className="p-3 text-right text-slate-300 print:text-slate-800 uppercase tracking-wider text-[11px]">
                                            Saldo Líquido Consolidado do Extrato:
                                        </td>
                                        <td className={`p-3 text-right font-mono text-sm ${Number(relatorio?.saldoLiquido || 0) >= 0
                                                ? "text-emerald-400 print:text-emerald-800"
                                                : "text-rose-400 print:text-rose-800"
                                            }`}>
                                            {formatarDinheiro(relatorio?.saldoLiquido)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Relatorios;
