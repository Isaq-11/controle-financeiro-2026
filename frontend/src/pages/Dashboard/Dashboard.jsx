import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, TrendingUp, TrendingDown, Calendar, Plus, Trash2, X } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import CarteiraService from "@/services/CarteiraService";
import TransacaoService from "@/services/TransacaoService";
import CategoriaService from "@/services/CategoriaService";

const carteiraService = new CarteiraService();
const transacaoService = new TransacaoService();
const categoriaService = new CategoriaService();

// Dados Ficticios (Mock) para demonstração quando não houver backend
const dadosResumoMock = {
    saldoAtual: 2500.00,
    totalReceitas: 2500.00,
    totalDespesas: 0.00
};

const dadosGraficoMock = [
    { dia: "01/Ago", receitas: 2500, despesas: 0 },
    { dia: "05/Ago", receitas: 0, despesas: 150 },
    { dia: "10/Ago", receitas: 500, despesas: 200 },
];

const dadosLancamentosMock = [
    { id: 1, descricao: "Saldo Inicial da Carteira", valor: 2500.00, tipo: "RECEITA", data: "01/08/2026", categoria: "Salário" }
];

const Dashboard = () => {
    const [carregando, setCarregando] = useState(true);
    const [resumo, setResumo] = useState(dadosResumoMock);
    const [grafico, setGrafico] = useState(dadosGraficoMock);
    const [lancamentos, setLancamentos] = useState(dadosLancamentosMock);
    const [carteiras, setCarteiras] = useState([]);
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    const [categorias, setCategorias] = useState([]);

    // Estado do Modal de Nova Transação
    const [modalAberto, setModalAberto] = useState(false);
    const [novaDescricao, setNovaDescricao] = useState("");
    const [novoValor, setNovoValor] = useState("");
    const [novoTipo, setNovoTipo] = useState("DESPESA");
    const [categoriaId, setCategoriaId] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensagemErroModal, setMensagemErroModal] = useState("");

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setCarregando(true);
        try {
            const respCarteiras = await carteiraService.buscarTodos();
            const listaCarteiras = respCarteiras.data || [];
            setCarteiras(listaCarteiras);

            // Carrega categorias do backend
            try {
                const respCats = await categoriaService.buscarTodos();
                setCategorias(respCats.data || []);
            } catch (e) {
                console.log("Erro ao carregar categorias:", e);
            }

            if (listaCarteiras.length > 0) {
                const primeiraCarteira = listaCarteiras[0];
                setCarteiraSelecionada(primeiraCarteira);
                await carregarDadosCarteira(primeiraCarteira.id);
            }
        } catch (error) {
            console.log("Modo offline / Dados demonstrativos ativados:", error.message);
        } finally {
            setCarregando(false);
        }
    };

    const carregarDadosCarteira = async (walletId) => {
        try {
            const resumoApi = await carteiraService.obterResumo(walletId);
            if (resumoApi) {
                setResumo({
                    saldoAtual: resumoApi.balance ?? resumoApi.saldoAtual ?? 0,
                    totalReceitas: resumoApi.totalIncome ?? resumoApi.totalReceitas ?? 0,
                    totalDespesas: resumoApi.totalExpense ?? resumoApi.totalDespesas ?? 0
                });

                if (Array.isArray(resumoApi.byMonth) && resumoApi.byMonth.length > 0) {
                    setGrafico(resumoApi.byMonth.map(m => ({
                        dia: m.month,
                        receitas: Number(m.income || 0),
                        despesas: Number(m.expense || 0)
                    })));
                }
            }

            const transacoesApi = await transacaoService.listarTransacoes(walletId);
            const conteudo = transacoesApi.content || transacoesApi;
            if (Array.isArray(conteudo)) {
                setLancamentos(conteudo.map(t => ({
                    id: t.id,
                    descricao: t.descricao,
                    valor: t.valor,
                    tipo: t.tipo,
                    data: t.data ? new Date(t.data).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
                    categoria: t.categoria?.nome || "Geral"
                })));
            }
        } catch (err) {
            console.log("Erro ao atualizar dados da carteira:", err);
        }
    };

    const handleCriarTransacao = async (e) => {
        e.preventDefault();
        setMensagemErroModal("");

        if (!novaDescricao.trim()) {
            setMensagemErroModal("A descrição é obrigatória!");
            return;
        }

        const valorNum = parseFloat(novoValor.replace(",", "."));
        if (isNaN(valorNum) || valorNum <= 0) {
            setMensagemErroModal("Insira um valor maior que zero!");
            return;
        }

        setEnviando(true);
        try {
            if (carteiraSelecionada) {
                const dto = {
                    descricao: novaDescricao,
                    valor: valorNum,
                    tipo: novoTipo,
                    data: new Date().toISOString().split("T")[0]
                };

                await transacaoService.criarTransacao(carteiraSelecionada.id, categoriaId || null, dto);
                await carregarDadosCarteira(carteiraSelecionada.id);
            } else {
                // Modo simulado local
                const novoItem = {
                    id: Date.now(),
                    descricao: novaDescricao,
                    valor: valorNum,
                    tipo: novoTipo,
                    data: new Date().toLocaleDateString("pt-BR"),
                    categoria: novoTipo === "RECEITA" ? "Receita" : "Despesa"
                };
                const novosLancamentos = [novoItem, ...lancamentos];
                setLancamentos(novosLancamentos);

                const rec = novosLancamentos.filter(l => l.tipo === "RECEITA").reduce((acc, l) => acc + l.valor, 0);
                const desp = novosLancamentos.filter(l => l.tipo === "DESPESA").reduce((acc, l) => acc + l.valor, 0);
                setResumo({
                    saldoAtual: rec - desp,
                    totalReceitas: rec,
                    totalDespesas: desp
                });
            }

            setNovaDescricao("");
            setNovoValor("");
            setModalAberto(false);
        } catch (err) {
            setMensagemErroModal(err.message || "Erro ao salvar transação no backend!");
        } finally {
            setEnviando(false);
        }
    };

    const handleExcluirTransacao = async (id) => {
        if (!confirm("Deseja realmente excluir esta transação?")) return;

        try {
            if (carteiraSelecionada) {
                await transacaoService.excluirTransacao(carteiraSelecionada.id, id);
                await carregarDadosCarteira(carteiraSelecionada.id);
            } else {
                const filtrados = lancamentos.filter(l => l.id !== id);
                setLancamentos(filtrados);
                const rec = filtrados.filter(l => l.tipo === "RECEITA").reduce((acc, l) => acc + l.valor, 0);
                const desp = filtrados.filter(l => l.tipo === "DESPESA").reduce((acc, l) => acc + l.valor, 0);
                setResumo({
                    saldoAtual: rec - desp,
                    totalReceitas: rec,
                    totalDespesas: desp
                });
            }
        } catch (err) {
            alert("Erro ao excluir: " + (err.message || "Falha na comunicação"));
        }
    };

    const formatarDinheiro = (valor) => {
        return "R$ " + Number(valor || 0).toFixed(2).replace(".", ",");
    };

    if (carregando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-300 gap-2">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-100 rounded-full animate-spin"></div>
                <p className="text-sm font-semibold">Carregando resumo financeiro...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">Dashboard Financeiro</h1>
                    <p className="text-slate-300 text-sm">Gerencie suas receitas e despesas com integração em tempo real</p>
                </div>
                <div className="flex items-center gap-3">
                    {carteiraSelecionada && (
                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-slate-400">Carteira:</span>
                            <span className="text-sm font-semibold text-slate-100">{carteiraSelecionada.nome}</span>
                        </div>
                    )}
                    <Button
                        onClick={() => setModalAberto(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nova Transação
                    </Button>
                </div>
            </div>

            {/* 1. Três Indicadores Numéricos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Saldo Atual</CardTitle>
                        <Wallet className="w-5 h-5 text-slate-300" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${Number(resumo.saldoAtual) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {formatarDinheiro(resumo.saldoAtual)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Total de Receitas</CardTitle>
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">
                            {formatarDinheiro(resumo.totalReceitas)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Total de Despesas</CardTitle>
                        <TrendingDown className="w-5 h-5 text-rose-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">
                            {formatarDinheiro(resumo.totalDespesas)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Gráfico usando Recharts */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-100">Fluxo de Caixa (Receitas vs Despesas)</CardTitle>
                    <p className="text-xs text-slate-300">Comparativo visual acumulado por mês/período</p>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={grafico}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="dia" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
                                <Area type="monotone" dataKey="receitas" name="Receita" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                <Area type="monotone" dataKey="despesas" name="Despesa" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Tabela de Lançamentos Recentes com opção de Exclusão */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-100">Lançamentos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-200">
                            <thead className="bg-slate-900 text-slate-300 text-xs uppercase">
                                <tr>
                                    <th className="p-3">Descrição</th>
                                    <th className="p-3">Categoria</th>
                                    <th className="p-3">Data</th>
                                    <th className="p-3 text-right">Valor</th>
                                    <th className="p-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {lancamentos.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-slate-400">
                                            Nenhuma transação encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    lancamentos.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-700/50">
                                            <td className="p-3 font-semibold text-slate-100">{item.descricao}</td>
                                            <td className="p-3 text-slate-300">{item.categoria}</td>
                                            <td className="p-3 text-slate-300 flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {item.data}
                                            </td>
                                            <td className={`p-3 text-right font-bold ${
                                                item.tipo === "RECEITA" ? "text-emerald-400" : "text-rose-400"
                                            }`}>
                                                {item.tipo === "RECEITA" ? "+ " : "- "}
                                                {formatarDinheiro(item.valor)}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => handleExcluirTransacao(item.id)}
                                                    title="Excluir Transação"
                                                    className="p-1.5 rounded hover:bg-rose-950/80 text-rose-400 hover:text-rose-200 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Cadastro de Nova Transação */}
            {modalAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                            <h2 className="text-lg font-bold text-slate-100">Nova Transação</h2>
                            <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {mensagemErroModal && (
                            <div className="p-2.5 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-semibold">
                                {mensagemErroModal}
                            </div>
                        )}

                        <form onSubmit={handleCriarTransacao} className="space-y-4">
                            <div>
                                <Label className="text-slate-300 text-xs font-semibold">Tipo de Movimentação</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setNovoTipo("RECEITA")}
                                        className={`py-2 text-xs font-bold rounded-lg border ${
                                            novoTipo === "RECEITA"
                                                ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                                                : "bg-slate-900 border-slate-700 text-slate-400"
                                        }`}
                                    >
                                        + Receita (Entrada)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNovoTipo("DESPESA")}
                                        className={`py-2 text-xs font-bold rounded-lg border ${
                                            novoTipo === "DESPESA"
                                                ? "bg-rose-950/80 border-rose-500 text-rose-300"
                                                : "bg-slate-900 border-slate-700 text-slate-400"
                                        }`}
                                    >
                                        - Despesa (Saída)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="descricao" className="text-slate-300 text-xs font-semibold">Descrição</Label>
                                <Input
                                    id="descricao"
                                    type="text"
                                    value={novaDescricao}
                                    onChange={(e) => setNovaDescricao(e.target.value)}
                                    placeholder="Ex: Supermercado, Salário, Internet"
                                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="valor" className="text-slate-300 text-xs font-semibold">Valor (R$)</Label>
                                <Input
                                    id="valor"
                                    type="text"
                                    value={novoValor}
                                    onChange={(e) => setNovoValor(e.target.value)}
                                    placeholder="0,00"
                                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                                />
                            </div>

                            {categorias.length > 0 && (
                                <div>
                                    <Label htmlFor="categoria" className="text-slate-300 text-xs font-semibold">Categoria</Label>
                                    <select
                                        id="categoria"
                                        value={categoriaId}
                                        onChange={(e) => setCategoriaId(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 mt-1"
                                    >
                                        <option value="">Selecione uma categoria...</option>
                                        {categorias.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nome} ({c.tipo})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setModalAberto(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-700"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={enviando}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                >
                                    {enviando ? "Salvando..." : "Salvar Transação"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
