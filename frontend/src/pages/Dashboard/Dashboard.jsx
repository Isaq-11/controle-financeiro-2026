import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Dados Ficticios (Mock) para o estudante entender
const dadosResumoMock = {
    saldoAtual: 3450.00,
    totalReceitas: 5000.00,
    totalDespesas: 1550.00
};

const dadosGraficoMock = [
    { dia: "01/Jul", receitas: 2000, despesas: 500 },
    { dia: "10/Jul", receitas: 1500, despesas: 300 },
    { dia: "20/Jul", receitas: 1500, despesas: 400 },
    { dia: "30/Jul", receitas: 0, despesas: 350 },
];

const dadosLancamentosMock = [
    { id: 1, descricao: "Salário Mensal", valor: 5000.00, tipo: "RECEITA", data: "01/07/2026", categoria: "Trabalho" },
    { id: 2, descricao: "Supermercado", valor: 650.00, tipo: "DESPESA", data: "05/07/2026", categoria: "Alimentação" },
    { id: 3, descricao: "Conta de Luz", valor: 150.00, tipo: "DESPESA", data: "10/07/2026", categoria: "Contas" },
    { id: 4, descricao: "Internet", valor: 100.00, tipo: "DESPESA", data: "15/07/2026", categoria: "Serviços" },
];

const Dashboard = () => {
    // ESTADOS: Estado de carregamento simulado (Promise) e os dados
    const [carregando, setCarregando] = useState(true);
    const [resumo, setResumo] = useState(null);
    const [grafico, setGrafico] = useState([]);
    const [lancamentos, setLancamentos] = useState([]);

    // useEffect roda assim que o componente entra na tela
    useEffect(() => {
        // Simula o tempo de resposta do servidor (Promise com 1.5 segundos)
        const timer = setTimeout(() => {
            setResumo(dadosResumoMock);
            setGrafico(dadosGraficoMock);
            setLancamentos(dadosLancamentosMock);
            setCarregando(false); // Desativa o carregamento
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Helper para formatar numero em Real (R$)
    const formatarDinheiro = (valor) => {
        return "R$ " + Number(valor).toFixed(2).replace(".", ",");
    };

    // Se ainda esta carregando os dados mockados
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
            <div>
                <h1 className="text-2xl font-bold text-slate-50">Dashboard Financeiro</h1>
                <p className="text-slate-300 text-sm">Resumo das suas finanças com dados de demonstração</p>
            </div>

            {/* 1. Três Indicadores Numéricos (Conforme especificado no documento) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Saldo Atual (Informações IHC de valor positivo/neutro) */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Saldo Atual</CardTitle>
                        <Wallet className="w-5 h-5 text-slate-300" />
                    </CardHeader>
                    <CardContent>
                        {/* IHC: Texto em azul/emerald discreto para indicar saldo positivo */}
                        <div className="text-2xl font-bold text-emerald-400">
                            {formatarDinheiro(resumo.saldoAtual)}
                        </div>
                    </CardContent>
                </Card>

                {/* Total de Receitas */}
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

                {/* Total de Despesas */}
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
                    <CardTitle className="text-lg text-slate-100">Gráfico de Entradas e Saídas</CardTitle>
                    <p className="text-xs text-slate-300">Comparativo visual de Receitas (Verde) vs Despesas (Vermelho)</p>
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

            {/* 3. Lista de Lançamentos Recentes */}
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {lancamentos.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-700/50">
                                        <td className="p-3 font-semibold text-slate-100">{item.descricao}</td>
                                        <td className="p-3 text-slate-300">{item.categoria}</td>
                                        <td className="p-3 text-slate-300 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {item.data}
                                        </td>
                                        {/* IHC: Verde para Receitas (+), Vermelho/Rose para Despesas (-) */}
                                        <td className={`p-3 text-right font-bold ${
                                            item.tipo === "RECEITA" ? "text-emerald-400" : "text-rose-400"
                                        }`}>
                                            {item.tipo === "RECEITA" ? "+ " : "- "}
                                            {formatarDinheiro(item.valor)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
