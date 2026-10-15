import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, TrendingUp, TrendingDown, Calendar, Plus, Trash2, X, Share2, Users, UserPlus, Shield, Zap, Radio } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import CarteiraService from "@/services/CarteiraService";
import TransacaoService from "@/services/TransacaoService";
import CategoriaService from "@/services/CategoriaService";
import { useAuth } from "@/services/AuthContext";
import { conectarEventosSse } from "@/services/SseService";

const carteiraService = new CarteiraService();
const transacaoService = new TransacaoService();
const categoriaService = new CategoriaService();

const Dashboard = () => {
    const { usuarioLogado } = useAuth();
    const navigate = useNavigate();
    const [carregando, setCarregando] = useState(true);
    const [resumo, setResumo] = useState({ saldoAtual: 0, totalReceitas: 0, totalDespesas: 0 });
    const [grafico, setGrafico] = useState([]);
    const [lancamentos, setLancamentos] = useState([]);
    const [carteiras, setCarteiras] = useState([]);
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [erroGeral, setErroGeral] = useState("");

    // Estado do SSE (Tempo Real)
    const [conectadoSse, setConectadoSse] = useState(false);
    const [notificacaoSse, setNotificacaoSse] = useState(null);
    const carteiraSelecionadaRef = useRef(null);

    useEffect(() => {
        carteiraSelecionadaRef.current = carteiraSelecionada;
    }, [carteiraSelecionada]);

    // Estado do Modal de Nova Transação
    const [modalAberto, setModalAberto] = useState(false);
    const [novaDescricao, setNovaDescricao] = useState("");
    const [novoValor, setNovoValor] = useState("");
    const [novoTipo, setNovoTipo] = useState("DESPESA");
    const [categoriaId, setCategoriaId] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensagemErroModal, setMensagemErroModal] = useState("");

    // Estado do Modal de Nova Carteira
    const [modalCarteiraAberto, setModalCarteiraAberto] = useState(false);
    const [nomeNovaCarteira, setNomeNovaCarteira] = useState("");
    const [descNovaCarteira, setDescNovaCarteira] = useState("");
    const [enviandoCarteira, setEnviandoCarteira] = useState(false);
    const [erroModalCarteira, setErroModalCarteira] = useState("");

    // Estado do Modal de Compartilhamento / Membros
    const [modalMembrosAberto, setModalMembrosAberto] = useState(false);
    const [membros, setMembros] = useState([]);
    const [carregandoMembros, setCarregandoMembros] = useState(false);
    const [novoMembroEmail, setNovoMembroEmail] = useState("");
    const [novoMembroPapel, setNovoMembroPapel] = useState("EDITOR");
    const [enviandoMembro, setEnviandoMembro] = useState(false);
    const [erroMembro, setErroMembro] = useState("");
    const [sucessoMembro, setSucessoMembro] = useState("");

    useEffect(() => {
        carregarDados();

        const token = usuarioLogado?.token || localStorage.getItem("token_usuario");
        const encerrarSse = conectarEventosSse(token, {
            onStatus: (status) => setConectadoSse(status),
            onTransacaoAlterada: (dados) => {
                if (carteiraSelecionadaRef.current && Number(dados.carteiraId) === Number(carteiraSelecionadaRef.current.id)) {
                    carregarDadosCarteira(carteiraSelecionadaRef.current.id);
                }
                const acaoTexto = dados.acao === "CRIADA" ? "adicionada" : dados.acao === "ATUALIZADA" ? "atualizada" : "removida";
                const autor = dados.autorNome ? ` por ${dados.autorNome}` : "";
                const val = dados.valor ? ` (R$ ${Number(dados.valor).toFixed(2).replace(".", ",")})` : "";
                setNotificacaoSse(`⚡ Transação ${acaoTexto}${autor}: "${dados.descricao || 'Lançamento'}"${val}`);
                setTimeout(() => setNotificacaoSse(null), 6000);
            },
            onCarteiraAlterada: () => {
                carregarDados(carteiraSelecionadaRef.current?.id);
                setNotificacaoSse("⚡ Carteira e permissões sincronizadas em tempo real!");
                setTimeout(() => setNotificacaoSse(null), 5000);
            }
        });

        return () => encerrarSse();
    }, [usuarioLogado?.token]);

    const carregarDados = async (manterCarteiraId = null) => {
        setCarregando(true);
        setErroGeral("");
        try {
            const respCarteiras = await carteiraService.buscarTodos();
            const listaCarteiras = respCarteiras.data || [];
            setCarteiras(listaCarteiras);

            // Carrega categorias do usuário do backend
            try {
                const respCats = await categoriaService.buscarTodos();
                setCategorias(respCats.data || []);
            } catch (e) {
                console.log("Categorias não carregadas:", e);
            }

            if (listaCarteiras.length > 0) {
                let carteiraAlvo = listaCarteiras[0];
                if (manterCarteiraId) {
                    const achada = listaCarteiras.find(c => c.id === manterCarteiraId);
                    if (achada) carteiraAlvo = achada;
                }
                setCarteiraSelecionada(carteiraAlvo);
                await carregarDadosCarteira(carteiraAlvo.id);
            } else {
                setCarteiraSelecionada(null);
                setLancamentos([]);
                setResumo({ saldoAtual: 0, totalReceitas: 0, totalDespesas: 0 });
                setGrafico([]);
            }
        } catch (error) {
            console.error("Erro ao carregar carteiras:", error);
            setErroGeral("Não foi possível carregar suas finanças do servidor. Verifique se o backend está em execução.");
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
                } else {
                    setGrafico([
                        { dia: "Atual", receitas: Number(resumoApi.totalIncome || 0), despesas: Number(resumoApi.totalExpense || 0) }
                    ]);
                }
            }

            const transacoesApi = await transacaoService.listarTransacoes(walletId);
            const conteudo = transacoesApi.content || transacoesApi;
            if (Array.isArray(conteudo)) {
                setLancamentos(conteudo.map(t => {
                    let dataFormatada = "";
                    if (t.data) {
                        if (typeof t.data === "string") {
                            const apenasData = t.data.split("T")[0];
                            const partes = apenasData.split("-");
                            if (partes.length === 3) {
                                dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                            } else {
                                dataFormatada = new Date(t.data).toLocaleDateString("pt-BR");
                            }
                        } else {
                            dataFormatada = new Date(t.data).toLocaleDateString("pt-BR");
                        }
                    } else {
                        dataFormatada = new Date().toLocaleDateString("pt-BR");
                    }

                    return {
                        id: t.id,
                        descricao: t.descricao,
                        valor: t.valor,
                        tipo: t.tipo,
                        data: dataFormatada,
                        categoria: t.categoria?.nome || "Geral"
                    };
                }));
            }
        } catch (err) {
            console.error("Erro ao carregar transações da carteira:", err);
        }
    };

    const handleTrocarCarteira = async (walletId) => {
        const idNum = Number(walletId);
        const achada = carteiras.find(c => c.id === idNum);
        if (achada) {
            setCarteiraSelecionada(achada);
            await carregarDadosCarteira(achada.id);
        }
    };

    // Criar nova Carteira
    const handleCriarCarteira = async (e) => {
        e.preventDefault();
        setErroModalCarteira("");
        if (!nomeNovaCarteira.trim()) {
            setErroModalCarteira("Informe o nome da carteira!");
            return;
        }

        setEnviandoCarteira(true);
        try {
            const resp = await carteiraService.inserir({
                nome: nomeNovaCarteira,
                descricao: descNovaCarteira
            });
            const nova = resp.data;
            setNomeNovaCarteira("");
            setDescNovaCarteira("");
            setModalCarteiraAberto(false);
            await carregarDados(nova?.id);
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || err.message || "Erro ao criar carteira";
            setErroModalCarteira(msg);
        } finally {
            setEnviandoCarteira(false);
        }
    };

    // Compartilhamento / Membros
    const abrirModalMembros = async () => {
        if (!carteiraSelecionada) return;
        setModalMembrosAberto(true);
        setErroMembro("");
        setSucessoMembro("");
        await carregarMembros();
    };

    const carregarMembros = async () => {
        if (!carteiraSelecionada) return;
        setCarregandoMembros(true);
        try {
            const lista = await carteiraService.listarMembros(carteiraSelecionada.id);
            setMembros(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error("Erro ao carregar membros:", err);
            setErroMembro("Não foi possível carregar a lista de membros.");
        } finally {
            setCarregandoMembros(false);
        }
    };

    const handleAdicionarMembro = async (e) => {
        e.preventDefault();
        setErroMembro("");
        setSucessoMembro("");

        if (!novoMembroEmail.trim()) {
            setErroMembro("Informe o e-mail do usuário.");
            return;
        }

        setEnviandoMembro(true);
        try {
            await carteiraService.adicionarMembro(carteiraSelecionada.id, {
                email: novoMembroEmail,
                role: novoMembroPapel
            });
            setNovoMembroEmail("");
            setSucessoMembro("Membro convidado/adicionado com sucesso!");
            await carregarMembros();
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || err.message || "Erro ao adicionar membro";
            setErroMembro(msg);
        } finally {
            setEnviandoMembro(false);
        }
    };

    const handleAlterarPapel = async (userId, novoPapel) => {
        setErroMembro("");
        setSucessoMembro("");
        try {
            await carteiraService.alterarPapelMembro(carteiraSelecionada.id, userId, { role: novoPapel });
            setSucessoMembro("Permissão do membro atualizada!");
            await carregarMembros();
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || "Erro ao alterar papel";
            setErroMembro(msg);
        }
    };

    const handleRemoverMembro = async (userId) => {
        if (!confirm("Deseja remover este membro da carteira?")) return;
        setErroMembro("");
        setSucessoMembro("");
        try {
            await carteiraService.removerMembro(carteiraSelecionada.id, userId);
            setSucessoMembro("Membro removido da carteira.");
            await carregarMembros();
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || "Erro ao remover membro";
            setErroMembro(msg);
        }
    };

    // Criar Transação
    const handleCriarTransacao = async (e) => {
        e.preventDefault();
        setMensagemErroModal("");

        if (!novaDescricao.trim()) {
            setMensagemErroModal("A descrição é obrigatória!");
            return;
        }

        const valorNum = parseFloat(novoValor.replace(",", "."));
        if (isNaN(valorNum) || valorNum <= 0) {
            setMensagemErroModal("Insira um valor válido maior que zero!");
            return;
        }

        if (!carteiraSelecionada) {
            setMensagemErroModal("Nenhuma carteira ativa selecionada.");
            return;
        }

        setEnviando(true);
        try {
            const agora = new Date();
            const ano = agora.getFullYear();
            const mes = String(agora.getMonth() + 1).padStart(2, "0");
            const dia = String(agora.getDate()).padStart(2, "0");
            const dataLocalStr = `${ano}-${mes}-${dia}`;

            const dto = {
                descricao: novaDescricao,
                valor: valorNum,
                tipo: novoTipo,
                data: dataLocalStr
            };

            await transacaoService.criarTransacao(carteiraSelecionada.id, categoriaId || null, dto);
            await carregarDadosCarteira(carteiraSelecionada.id);

            setNovaDescricao("");
            setNovoValor("");
            setModalAberto(false);
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || err.message || "Erro ao salvar transação!";
            setMensagemErroModal(msg);
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
            }
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || "Erro ao excluir transação";
            alert(msg);
        }
    };

    const formatarDinheiro = (valor) => {
        return "R$ " + Number(valor || 0).toFixed(2).replace(".", ",");
    };

    if (carregando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-300 gap-2">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-100 rounded-full animate-spin"></div>
                <p className="text-sm font-semibold">Carregando dados financeiros da sua conta...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {erroGeral && (
                <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-sm font-medium">
                    {erroGeral}
                </div>
            )}

            {notificacaoSse && (
                <div className="p-3.5 rounded-xl bg-indigo-950/90 border border-indigo-500 text-indigo-100 text-sm font-semibold flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2.5">
                        <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                        <span>{notificacaoSse}</span>
                    </div>
                    <button onClick={() => setNotificacaoSse(null)} className="text-indigo-300 hover:text-white p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-50">Controle suas finanças!!</h1>
                        {conectadoSse ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-600/70 text-emerald-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Tempo Real: Conectado
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                Tempo Real: Conectando...
                            </span>
                        )}
                    </div>
                    <p className="text-slate-300 text-sm mt-0.5">Finanças e saldos atualizados em tempo real.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Seletor de Carteira */}
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <select
                            value={carteiraSelecionada?.id || ""}
                            onChange={(e) => handleTrocarCarteira(e.target.value)}
                            className="bg-slate-900 text-slate-100 text-sm font-semibold border-none focus:ring-0 cursor-pointer"
                        >
                            {carteiras.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => navigate("/carteiras")}
                        className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
                    >
                        <Users className="w-3.5 h-3.5 text-emerald-400" /> Carteiras & Membros
                    </Button>

                    <Button
                        onClick={() => setModalAberto(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" /> Nova Transação
                    </Button>
                </div>
            </div>

            {/* 1. Indicadores Numéricos */}
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
                    <p className="text-xs text-slate-300">Comparativo visual de Entradas e Saídas na carteira ativa</p>
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

            {/* 3. Tabela de Lançamentos Recentes */}
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
                                            Nenhuma transação cadastrada nesta carteira. Clique em "+ Nova Transação" para adicionar.
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
                                            <td className={`p-3 text-right font-bold ${item.tipo === "RECEITA" ? "text-emerald-400" : "text-rose-400"
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
                                        className={`py-2 text-xs font-bold rounded-lg border ${novoTipo === "RECEITA"
                                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                                            : "bg-slate-900 border-slate-700 text-slate-400"
                                            }`}
                                    >
                                        + Receita (Entrada)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNovoTipo("DESPESA")}
                                        className={`py-2 text-xs font-bold rounded-lg border ${novoTipo === "DESPESA"
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
                                    {enviando ? "Salvando no Banco..." : "Salvar Transação"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Criar Nova Carteira */}
            {modalCarteiraAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-400" /> Nova Carteira
                            </h2>
                            <button onClick={() => setModalCarteiraAberto(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {erroModalCarteira && (
                            <div className="p-2.5 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-semibold">
                                {erroModalCarteira}
                            </div>
                        )}

                        <form onSubmit={handleCriarCarteira} className="space-y-4">
                            <div>
                                <Label htmlFor="nomeCarteira" className="text-slate-300 text-xs font-semibold">Nome da Carteira</Label>
                                <Input
                                    id="nomeCarteira"
                                    type="text"
                                    value={nomeNovaCarteira}
                                    onChange={(e) => setNomeNovaCarteira(e.target.value)}
                                    placeholder="Ex: Carteira Pessoal, Viagem 2026, Projeto Compartilhado"
                                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="descCarteira" className="text-slate-300 text-xs font-semibold">Descrição (Opcional)</Label>
                                <Input
                                    id="descCarteira"
                                    type="text"
                                    value={descNovaCarteira}
                                    onChange={(e) => setDescNovaCarteira(e.target.value)}
                                    placeholder="Ex: Gastos compartilhados com a família"
                                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setModalCarteiraAberto(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-700"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={enviandoCarteira}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                >
                                    {enviandoCarteira ? "Criando Carteira..." : "Criar Carteira"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Gestão de Membros / Compartilhamento */}
            {modalMembrosAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" /> Membros da Carteira
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">{carteiraSelecionada?.nome}</p>
                            </div>
                            <button onClick={() => setModalMembrosAberto(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {erroMembro && (
                            <div className="p-2.5 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-semibold">
                                {erroMembro}
                            </div>
                        )}

                        {sucessoMembro && (
                            <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-semibold">
                                {sucessoMembro}
                            </div>
                        )}

                        {/* Formulário para Adicionar Membro por E-mail */}
                        <form onSubmit={handleAdicionarMembro} className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-3">
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <UserPlus className="w-4 h-4 text-blue-400" /> Convidar / Adicionar Membro
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-2">
                                    <Input
                                        type="email"
                                        value={novoMembroEmail}
                                        onChange={(e) => setNovoMembroEmail(e.target.value)}
                                        placeholder="E-mail do usuário cadastrado"
                                        className="bg-slate-800 border-slate-700 text-slate-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={novoMembroPapel}
                                        onChange={(e) => setNovoMembroPapel(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-md p-2"
                                    >
                                        <option value="EDITOR">EDITOR</option>
                                        <option value="VISUALIZADOR">VISUALIZADOR</option>
                                    </select>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={enviandoMembro}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                            >
                                {enviandoMembro ? "Adicionando..." : "Adicionar Membro"}
                            </Button>
                        </form>

                        {/* Lista de Membros Atuais */}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Membros Atuais</h3>
                            {carregandoMembros ? (
                                <p className="text-xs text-slate-400">Carregando membros...</p>
                            ) : membros.length === 0 ? (
                                <p className="text-xs text-slate-500">Nenhum membro encontrado.</p>
                            ) : (
                                membros.map((m) => (
                                    <div key={m.id || m.usuario?.id} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                                        <div className="flex items-center gap-2">
                                            <Shield className={`w-4 h-4 ${m.papel === "DONO" ? "text-amber-400" : m.papel === "EDITOR" ? "text-emerald-400" : "text-slate-400"
                                                }`} />
                                            <div>
                                                <p className="text-xs font-bold text-slate-100">{m.usuario?.nome || m.usuario?.email}</p>
                                                <p className="text-[10px] text-slate-400">{m.usuario?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${m.papel === "DONO"
                                                ? "bg-amber-950/80 border-amber-600 text-amber-300"
                                                : m.papel === "EDITOR"
                                                    ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                                                    : "bg-slate-800 border-slate-600 text-slate-300"
                                                }`}>
                                                {m.papel}
                                            </span>

                                            {m.papel !== "DONO" && (
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        value={m.papel}
                                                        onChange={(e) => handleAlterarPapel(m.usuario.id, e.target.value)}
                                                        className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] rounded p-1"
                                                    >
                                                        <option value="EDITOR">EDITOR</option>
                                                        <option value="VISUALIZADOR">VISUALIZADOR</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleRemoverMembro(m.usuario.id)}
                                                        title="Remover Membro"
                                                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
