import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Tag, 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    AlertCircle, 
    RefreshCw, 
    Wallet, 
    Shield, 
    Lock, 
    TrendingUp, 
    TrendingDown, 
    X,
    FolderPlus,
    Palette
} from "lucide-react";
import CarteiraService from "@/services/CarteiraService";
import CategoriaService from "@/services/CategoriaService";
import { useAuth } from "@/services/AuthContext";
import { conectarEventosSse } from "@/services/SseService";

const carteiraService = new CarteiraService();
const categoriaService = new CategoriaService();

// Paleta de cores recomendadas
const CORES_PALETA = [
    { nome: "Verde Esmeralda", hex: "#10B981" },
    { nome: "Azul Real", hex: "#3B82F6" },
    { nome: "Roxo / Violeta", hex: "#8B5CF6" },
    { nome: "Rosa Choque", hex: "#EC4899" },
    { nome: "Âmbar / Laranja", hex: "#F59E0B" },
    { nome: "Vermelho / Rosa", hex: "#EF4444" },
    { nome: "Azul Índigo", hex: "#6366F1" },
    { nome: "Turquesa", hex: "#14B8A6" },
    { nome: "Cinza Ardósia", hex: "#64748B" }
];

// Ícones predefinidos disponíveis
const ICONES_DISPONIVEIS = [
    { id: "tag", rotulo: "Etiqueta" },
    { id: "wallet", rotulo: "Carteira" },
    { id: "shopping-bag", rotulo: "Compras" },
    { id: "car", rotulo: "Transporte" },
    { id: "home", rotulo: "Moradia" },
    { id: "smile", rotulo: "Lazer" },
    { id: "heart-pulse", rotulo: "Saúde" },
    { id: "trending-up", rotulo: "Investimento" },
    { id: "dollar-sign", rotulo: "Salário / Dinheiro" }
];

const Categorias = () => {
    const { usuarioLogado } = useAuth();
    const [carteiras, setCarteiras] = useState([]);
    const [carteiraSelecionada, setCarteiraSelecionada] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState("TODOS"); // "TODOS", "RECEITA", "DESPESA"
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    // Modal Nova / Editar Categoria
    const [modalAberto, setModalAberto] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [nomeCategoria, setNomeCategoria] = useState("");
    const [tipoCategoria, setTipoCategoria] = useState("DESPESA");
    const [corCategoria, setCorCategoria] = useState("#EF4444");
    const [iconeCategoria, setIconeCategoria] = useState("tag");
    const [enviando, setEnviando] = useState(false);
    const [erroModal, setErroModal] = useState("");

    // Identifica se o usuário logado é o DONO da carteira ativa
    const ehDono = carteiraSelecionada?.dono?.id === usuarioLogado?.id;

    useEffect(() => {
        carregarCarteiras();

        const token = usuarioLogado?.token || sessionStorage.getItem("token_usuario") || localStorage.getItem("token_usuario");
        const encerrarSse = conectarEventosSse(token, {
            onCarteiraAlterada: (dados) => {
                if (carteiraSelecionada && Number(dados.carteiraId) === Number(carteiraSelecionada.id)) {
                    carregarCategorias(carteiraSelecionada.id);
                }
            }
        });

        return () => encerrarSse();
    }, [carteiraSelecionada?.id, usuarioLogado?.token]);

    const carregarCarteiras = async () => {
        setCarregando(true);
        setErro("");
        try {
            const resp = await carteiraService.buscarTodos();
            const lista = resp.data || [];
            setCarteiras(lista);

            if (lista.length > 0) {
                const ativa = carteiraSelecionada 
                    ? lista.find(c => c.id === carteiraSelecionada.id) || lista[0]
                    : lista[0];
                setCarteiraSelecionada(ativa);
                await carregarCategorias(ativa.id);
            } else {
                setCarteiraSelecionada(null);
                setCategorias([]);
            }
        } catch (err) {
            console.error("Erro ao listar carteiras:", err);
            setErro("Não foi possível carregar as carteiras.");
        } finally {
            setCarregando(false);
        }
    };

    const carregarCategorias = async (walletId) => {
        try {
            const dados = await categoriaService.listarPorCarteira(walletId);
            setCategorias(Array.isArray(dados) ? dados : []);
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
            setErro("Erro ao carregar as categorias da carteira.");
        }
    };

    const handleTrocarCarteira = async (c) => {
        setCarteiraSelecionada(c);
        setErro("");
        setSucesso("");
        await carregarCategorias(c.id);
    };

    const abrirModalNovo = () => {
        setCategoriaEditando(null);
        setNomeCategoria("");
        setTipoCategoria("DESPESA");
        setCorCategoria("#EF4444");
        setIconeCategoria("tag");
        setErroModal("");
        setModalAberto(true);
    };

    const abrirModalEditar = (cat) => {
        setCategoriaEditando(cat);
        setNomeCategoria(cat.nome);
        setTipoCategoria(cat.tipo);
        setCorCategoria(cat.cor || "#10B981");
        setIconeCategoria(cat.icone || "tag");
        setErroModal("");
        setModalAberto(true);
    };

    const handleSalvarCategoria = async (e) => {
        e.preventDefault();
        setErroModal("");

        if (!nomeCategoria.trim()) {
            setErroModal("Informe o nome da categoria.");
            return;
        }

        if (!carteiraSelecionada) {
            setErroModal("Nenhuma carteira selecionada.");
            return;
        }

        setEnviando(true);
        try {
            const payload = {
                nome: nomeCategoria.trim(),
                tipo: tipoCategoria,
                cor: corCategoria,
                icone: iconeCategoria
            };

            if (categoriaEditando) {
                await categoriaService.atualizar(categoriaEditando.id, payload);
                setSucesso(`Categoria "${payload.nome}" atualizada com sucesso!`);
            } else {
                await categoriaService.criarParaCarteira(carteiraSelecionada.id, payload);
                setSucesso(`Categoria "${payload.nome}" criada para esta carteira!`);
            }

            setModalAberto(false);
            await carregarCategorias(carteiraSelecionada.id);
            setTimeout(() => setSucesso(""), 4000);
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || err.message || "Erro ao salvar categoria.";
            setErroModal(msg);
        } finally {
            setEnviando(false);
        }
    };

    const handleExcluirCategoria = async (cat) => {
        if (!confirm(`Tem certeza que deseja excluir a categoria "${cat.nome}"?`)) return;

        setErro("");
        setSucesso("");
        try {
            await categoriaService.excluir(cat.id);
            setSucesso(`Categoria "${cat.nome}" excluída com sucesso!`);
            await carregarCategorias(carteiraSelecionada.id);
            setTimeout(() => setSucesso(""), 4000);
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || "Não foi possível excluir a categoria. Verifique se existem transações vinculadas.";
            setErro(msg);
            setTimeout(() => setErro(""), 6000);
        }
    };

    // Categorias filtradas por tipo
    const categoriasExibidas = categorias.filter(c => {
        if (filtroTipo === "TODOS") return true;
        return c.tipo === filtroTipo;
    });

    const totalReceitas = categorias.filter(c => c.tipo === "RECEITA").length;
    const totalDespesas = categorias.filter(c => c.tipo === "DESPESA").length;

    return (
        <div className="space-y-6">
            {/* Header da Tela */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                        <Tag className="w-6 h-6 text-emerald-400" />
                        Categorias da Carteira
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Cada carteira possui suas próprias categorias personalizadas. Apenas o <strong className="text-amber-400">DONO</strong> pode criar, editar ou excluir.
                    </p>
                </div>

                {carteiraSelecionada && ehDono && (
                    <Button
                        onClick={abrirModalNovo}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
                    >
                        <Plus className="w-4 h-4" /> Nova Categoria
                    </Button>
                )}
            </div>

            {/* Avisos de Sucesso ou Erro */}
            {sucesso && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {sucesso}
                </div>
            )}

            {erro && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {erro}
                </div>
            )}

            {/* Seletor de Carteira Ativa */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-400" /> Selecione a Carteira:
                    </span>
                    {carteiraSelecionada && (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                                ehDono 
                                    ? "bg-amber-950/80 border-amber-600 text-amber-300"
                                    : "bg-blue-950/80 border-blue-600 text-blue-300"
                            }`}>
                                <Shield className="w-3.5 h-3.5" />
                                {ehDono ? "Você é o DONO (Acesso Total)" : "Modo Leitura (Apenas Visualização)"}
                            </span>
                        </div>
                    )}
                </div>

                {carregando ? (
                    <div className="text-slate-400 text-xs py-2">Carregando carteiras...</div>
                ) : carteiras.length === 0 ? (
                    <div className="text-slate-400 text-xs py-2">Nenhuma carteira encontrada. Crie uma carteira primeiro.</div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {carteiras.map(c => {
                            const ativa = carteiraSelecionada?.id === c.id;
                            const donoCarteira = c.dono?.id === usuarioLogado?.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => handleTrocarCarteira(c)}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                                        ativa
                                            ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40"
                                            : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    <Wallet className="w-3.5 h-3.5" />
                                    <span>{c.nome}</span>
                                    {donoCarteira && (
                                        <span className="text-[10px] bg-slate-900/60 text-amber-300 px-1.5 py-0.5 rounded">Dono</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Aviso informativo caso o usuário não seja o dono */}
            {carteiraSelecionada && !ehDono && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs flex items-center gap-3">
                    <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                        Você tem permissão de membro nesta carteira. Você pode visualizar e utilizar essas categorias ao lançar transações, porém apenas o proprietário da carteira (<strong className="text-blue-100">{carteiraSelecionada.dono?.name || carteiraSelecionada.dono?.email}</strong>) pode criar novas categorias ou alterar as existentes.
                    </span>
                </div>
            )}

            {/* Barra de Filtros e Contadores */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFiltroTipo("TODOS")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            filtroTipo === "TODOS"
                                ? "bg-slate-800 border-slate-600 text-slate-100"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        Todas ({categorias.length})
                    </button>
                    <button
                        onClick={() => setFiltroTipo("RECEITA")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                            filtroTipo === "RECEITA"
                                ? "bg-emerald-950 border-emerald-600 text-emerald-300"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-300"
                        }`}
                    >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Receitas ({totalReceitas})
                    </button>
                    <button
                        onClick={() => setFiltroTipo("DESPESA")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                            filtroTipo === "DESPESA"
                                ? "bg-rose-950 border-rose-600 text-rose-300"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300"
                        }`}
                    >
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        Despesas ({totalDespesas})
                    </button>
                </div>

                <button
                    onClick={() => carteiraSelecionada && carregarCategorias(carteiraSelecionada.id)}
                    title="Recarregar Categorias"
                    className="self-end text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                    <RefreshCw className="w-3 h-3" /> Atualizar
                </button>
            </div>

            {/* Grid de Categorias */}
            {categoriasExibidas.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                    <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-sm">Nenhuma categoria encontrada para este filtro.</p>
                    {ehDono && (
                        <Button
                            onClick={abrirModalNovo}
                            className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                            Criar Primeira Categoria
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoriasExibidas.map((cat) => {
                        const ehReceita = cat.tipo === "RECEITA";
                        const corVisual = cat.cor || (ehReceita ? "#10B981" : "#EF4444");

                        return (
                            <div
                                key={cat.id}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between transition-all group shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Indicador de Cor & Ícone */}
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                                        style={{ backgroundColor: corVisual }}
                                    >
                                        <Tag className="w-5 h-5 text-white/90" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-100 text-sm truncate">{cat.nome}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                                    ehReceita
                                                        ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                                                        : "bg-rose-950/80 border-rose-600 text-rose-300"
                                                }`}
                                            >
                                                {ehReceita ? "+ Receita" : "- Despesa"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                                                {corVisual}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de Ação (Apenas para o DONO da Carteira) */}
                                {ehDono ? (
                                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => abrirModalEditar(cat)}
                                            title="Editar Categoria"
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleExcluirCategoria(cat)}
                                            title="Excluir Categoria"
                                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-900/50 text-rose-300 hover:text-rose-100 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <span title="Apenas o Dono pode alterar" className="text-slate-600">
                                        <Lock className="w-4 h-4" />
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Criação / Edição de Categoria */}
            {modalAberto && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button
                            onClick={() => setModalAberto(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-emerald-950/60 border border-emerald-600/50 rounded-lg text-emerald-400">
                                <FolderPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-100">
                                    {categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Vinculada à carteira: <strong className="text-emerald-400">{carteiraSelecionada?.nome}</strong>
                                </p>
                            </div>
                        </div>

                        {erroModal && (
                            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-semibold">
                                {erroModal}
                            </div>
                        )}

                        <form onSubmit={handleSalvarCategoria} className="space-y-4">
                            {/* Nome */}
                            <div>
                                <Label htmlFor="catNome" className="text-xs font-semibold text-slate-300">Nome da Categoria</Label>
                                <Input
                                    id="catNome"
                                    type="text"
                                    value={nomeCategoria}
                                    onChange={(e) => setNomeCategoria(e.target.value)}
                                    placeholder="Ex: Assinaturas, Mercado, Freelance, Educação"
                                    className="bg-slate-950 border-slate-700 text-slate-100 mt-1"
                                    required
                                />
                            </div>

                            {/* Tipo (Receita vs Despesa) */}
                            <div>
                                <Label className="text-xs font-semibold text-slate-300">Tipo de Movimentação</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTipoCategoria("RECEITA");
                                            if (corCategoria === "#EF4444") setCorCategoria("#10B981");
                                        }}
                                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                            tipoCategoria === "RECEITA"
                                                ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                                                : "bg-slate-950 border-slate-800 text-slate-400"
                                        }`}
                                    >
                                        + Receita (Entrada)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTipoCategoria("DESPESA");
                                            if (corCategoria === "#10B981") setCorCategoria("#EF4444");
                                        }}
                                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                            tipoCategoria === "DESPESA"
                                                ? "bg-rose-950 border-rose-500 text-rose-300"
                                                : "bg-slate-950 border-slate-800 text-slate-400"
                                        }`}
                                    >
                                        - Despesa (Saída)
                                    </button>
                                </div>
                            </div>

                            {/* Seleção de Cores */}
                            <div>
                                <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                                    <span>Cor da Categoria</span>
                                    <span className="font-mono text-[10px] text-slate-400">{corCategoria}</span>
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-1.5">
                                    {CORES_PALETA.map(c => (
                                        <button
                                            key={c.hex}
                                            type="button"
                                            onClick={() => setCorCategoria(c.hex)}
                                            style={{ backgroundColor: c.hex }}
                                            className={`w-7 h-7 rounded-lg transition-transform ${
                                                corCategoria.toLowerCase() === c.hex.toLowerCase()
                                                    ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                                                    : "opacity-80 hover:opacity-100"
                                            }`}
                                            title={c.nome}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Palette className="w-4 h-4 text-slate-400" />
                                    <Input
                                        type="color"
                                        value={corCategoria}
                                        onChange={(e) => setCorCategoria(e.target.value)}
                                        className="w-12 h-8 p-1 bg-slate-950 border-slate-700 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={corCategoria}
                                        onChange={(e) => setCorCategoria(e.target.value)}
                                        placeholder="#HEX"
                                        className="h-8 bg-slate-950 border-slate-700 text-xs text-slate-200 uppercase font-mono"
                                    />
                                </div>
                            </div>

                            {/* Seleção de Ícone */}
                            <div>
                                <Label className="text-xs font-semibold text-slate-300">Ícone / Rótulo</Label>
                                <select
                                    value={iconeCategoria}
                                    onChange={(e) => setIconeCategoria(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 mt-1"
                                >
                                    {ICONES_DISPONIVEIS.map(ic => (
                                        <option key={ic.id} value={ic.id}>
                                            {ic.rotulo} ({ic.id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Botões do Formulário */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setModalAberto(false)}
                                    className="border-slate-700 text-slate-300 text-xs"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={enviando}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                                >
                                    {enviando ? "Salvando..." : (categoriaEditando ? "Salvar Alterações" : "Criar Categoria")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorias;
