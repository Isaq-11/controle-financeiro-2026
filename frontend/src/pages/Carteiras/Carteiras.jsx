import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Users, UserPlus, Shield, Trash2, Plus, X, Check, RefreshCw } from "lucide-react";
import CarteiraService from "@/services/CarteiraService";
import { useAuth } from "@/services/AuthContext";
import { conectarEventosSse } from "@/services/SseService";

const carteiraService = new CarteiraService();

const Carteiras = () => {
    const { usuarioLogado } = useAuth();
    const [carteiras, setCarteiras] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    // Modal Nova Carteira
    const [modalNovaCarteira, setModalNovaCarteira] = useState(false);
    const [nomeCarteira, setNomeCarteira] = useState("");
    const [descCarteira, setDescCarteira] = useState("");
    const [enviandoNova, setEnviandoNova] = useState(false);

    // Gestão de Membros de uma Carteira Selecionada
    const [carteiraAtiva, setCarteiraAtiva] = useState(null);
    const [membros, setMembros] = useState([]);
    const [carregandoMembros, setCarregandoMembros] = useState(false);
    const [novoEmail, setNovoEmail] = useState("");
    const [novoPapel, setNovoPapel] = useState("EDITOR");
    const [enviandoMembro, setEnviandoMembro] = useState(false);
    const [erroMembro, setErroMembro] = useState("");
    const [sucessoMembro, setSucessoMembro] = useState("");

    useEffect(() => {
        carregarCarteiras();

        // Ouvinte SSE em tempo real para mudanças na carteira/membros
        const token = usuarioLogado?.token || localStorage.getItem("token_usuario");
        const encerrarSse = conectarEventosSse(token, {
            onCarteiraAlterada: (dados) => {
                carregarCarteiras();
                if (carteiraAtiva && dados.carteiraId === carteiraAtiva.id) {
                    carregarMembros(carteiraAtiva.id);
                }
            }
        });

        return () => encerrarSse();
    }, [carteiraAtiva?.id, usuarioLogado?.token]);

    const carregarCarteiras = async () => {
        setCarregando(true);
        setErro("");
        try {
            const resp = await carteiraService.buscarTodos();
            const lista = resp.data || [];
            setCarteiras(lista);
            if (!carteiraAtiva && lista.length > 0) {
                selecionarCarteiraParaMembros(lista[0]);
            }
        } catch (err) {
            console.error("Erro ao listar carteiras:", err);
            setErro("Não foi possível carregar a lista de carteiras.");
        } finally {
            setCarregando(false);
        }
    };

    const selecionarCarteiraParaMembros = async (carteira) => {
        setCarteiraAtiva(carteira);
        setErroMembro("");
        setSucessoMembro("");
        await carregarMembros(carteira.id);
    };

    const carregarMembros = async (walletId) => {
        setCarregandoMembros(true);
        try {
            const dadosMembros = await carteiraService.listarMembros(walletId);
            setMembros(Array.isArray(dadosMembros) ? dadosMembros : []);
        } catch (err) {
            console.error("Erro ao listar membros:", err);
            setErroMembro("Não foi possível carregar os membros desta carteira.");
        } finally {
            setCarregandoMembros(false);
        }
    };

    const handleCriarCarteira = async (e) => {
        e.preventDefault();
        setErro("");
        setSucesso("");
        if (!nomeCarteira.trim()) {
            setErro("O nome da carteira é obrigatório.");
            return;
        }

        setEnviandoNova(true);
        try {
            const resp = await carteiraService.inserir({
                nome: nomeCarteira,
                descricao: descCarteira
            });
            setNomeCarteira("");
            setDescCarteira("");
            setModalNovaCarteira(false);
            setSucesso("Carteira criada com sucesso!");
            await carregarCarteiras();
            if (resp.data) {
                selecionarCarteiraParaMembros(resp.data);
            }
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || err.message || "Erro ao criar carteira.";
            setErro(msg);
        } finally {
            setEnviandoNova(false);
        }
    };

    const handleAdicionarMembro = async (e) => {
        e.preventDefault();
        setErroMembro("");
        setSucessoMembro("");

        if (!novoEmail.trim()) {
            setErroMembro("Informe o e-mail do usuário para compartilhar.");
            return;
        }

        setEnviandoMembro(true);
        try {
            await carteiraService.adicionarMembro(carteiraAtiva.id, {
                email: novoEmail.trim(),
                role: novoPapel
            });
            setNovoEmail("");
            setSucessoMembro("Membro adicionado à carteira com sucesso!");
            await carregarMembros(carteiraAtiva.id);
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || err.message || "Erro ao adicionar membro.";
            setErroMembro(msg);
        } finally {
            setEnviandoMembro(false);
        }
    };

    const handleAlterarPapel = async (userId, papel) => {
        setErroMembro("");
        setSucessoMembro("");
        try {
            await carteiraService.alterarPapelMembro(carteiraAtiva.id, userId, { role: papel });
            setSucessoMembro("Permissão do membro atualizada!");
            await carregarMembros(carteiraAtiva.id);
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || "Erro ao alterar papel.";
            setErroMembro(msg);
        }
    };

    const handleRemoverMembro = async (userId) => {
        if (!confirm("Tem certeza que deseja remover este membro da carteira?")) return;
        setErroMembro("");
        setSucessoMembro("");
        try {
            await carteiraService.removerMembro(carteiraAtiva.id, userId);
            setSucessoMembro("Membro removido da carteira.");
            await carregarMembros(carteiraAtiva.id);
        } catch (err) {
            const msg = err.response?.data?.mensagem || err.response?.data?.message || "Erro ao remover membro.";
            setErroMembro(msg);
        }
    };

    const souDonoDaCarteiraAtiva = () => {
        if (!carteiraAtiva || !usuarioLogado) return false;
        return carteiraAtiva.dono?.id === usuarioLogado.id;
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho da Página */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-emerald-400" /> Carteiras & Compartilhamento
                    </h1>
                    <p className="text-slate-300 text-sm">
                        Gerencie suas carteiras e compartilhe o acesso com outros usuários definindo papéis de permissão.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setModalNovaCarteira(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Nova Carteira
                    </Button>
                </div>
            </div>

            {sucesso && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {sucesso}
                </div>
            )}

            {erro && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-sm font-semibold">
                    {erro}
                </div>
            )}

            {/* Layout em Duas Colunas: Lista de Carteiras na Esquerda e Membros da Carteira na Direita */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna 1: Minhas Carteiras */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>Minhas Carteiras ({carteiras.length})</span>
                        <button onClick={carregarCarteiras} title="Recarregar" className="text-slate-400 hover:text-slate-200">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </h2>

                    {carregando ? (
                        <div className="text-center py-8 text-slate-400 text-sm">Carregando carteiras...</div>
                    ) : carteiras.length === 0 ? (
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-sm">
                            Nenhuma carteira cadastrada.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {carteiras.map((c) => {
                                const selecionada = carteiraAtiva?.id === c.id;
                                const souDono = c.dono?.id === usuarioLogado?.id;
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => selecionarCarteiraParaMembros(c)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selecionada
                                            ? "bg-slate-800 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30"
                                            : "bg-slate-900 border-slate-800 hover:bg-slate-800/60"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-slate-100 text-sm">{c.nome}</h3>
                                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                    {c.descricao || "Sem descrição"}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${souDono
                                                ? "bg-amber-950/80 border-amber-600 text-amber-300"
                                                : "bg-blue-950/80 border-blue-600 text-blue-300"
                                                }`}>
                                                {souDono ? "DONO" : "COMPARTILHADA"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Coluna 2 e 3: Gestão de Membros da Carteira Selecionada */}
                <div className="lg:col-span-2 space-y-4">
                    {carteiraAtiva ? (
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader className="border-b border-slate-700/80 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-blue-400" /> Membros de "{carteiraAtiva.nome}"
                                        </CardTitle>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Dono: <span className="text-slate-200 font-semibold">{carteiraAtiva.dono?.name || carteiraAtiva.dono?.email}</span>
                                        </p>
                                    </div>

                                    <div className="text-xs">
                                        {souDonoDaCarteiraAtiva() ? (
                                            <span className="bg-emerald-950/80 border border-emerald-600 text-emerald-300 px-2.5 py-1 rounded font-semibold">
                                                Você pode gerenciar permissões
                                            </span>
                                        ) : (
                                            <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2.5 py-1 rounded">
                                                Apenas o Dono pode adicionar/remover
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-5 space-y-6">
                                {sucessoMembro && (
                                    <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                                        <Check className="w-4 h-4" /> {sucessoMembro}
                                    </div>
                                )}

                                {erroMembro && (
                                    <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-semibold">
                                        {erroMembro}
                                    </div>
                                )}

                                {/* Formulário para Adicionar Membro (Visível se for Dono) */}
                                {souDonoDaCarteiraAtiva() && (
                                    <form onSubmit={handleAdicionarMembro} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                            <UserPlus className="w-4 h-4 text-blue-400" /> Convidar / Adicionar Membro
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="sm:col-span-2">
                                                <Input
                                                    type="email"
                                                    value={novoEmail}
                                                    onChange={(e) => setNovoEmail(e.target.value)}
                                                    placeholder="Digite o e-mail do usuário cadastrado"
                                                    className="bg-slate-800 border-slate-700 text-slate-100 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <select
                                                    value={novoPapel}
                                                    onChange={(e) => setNovoPapel(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-md p-2.5 cursor-pointer"
                                                >
                                                    <option value="EDITOR">EDITOR (Lança gastos)</option>
                                                    <option value="VISUALIZADOR">VISUALIZADOR (Somente leitura)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={enviandoMembro}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                                        >
                                            {enviandoMembro ? "Convidando..." : "Adicionar Membro à Carteira"}
                                        </Button>
                                    </form>
                                )}

                                {/* Tabela / Lista de Membros */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Membros com Acesso ({membros.length})
                                    </h3>

                                    {carregandoMembros ? (
                                        <div className="text-center py-6 text-slate-400 text-xs">Carregando membros...</div>
                                    ) : membros.length === 0 ? (
                                        <div className="text-center py-6 text-slate-500 text-xs">Nenhum membro vinculado.</div>
                                    ) : (
                                        <div className="divide-y divide-slate-700 border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
                                            {membros.map((m) => {
                                                const ehDono = m.papel === "DONO";
                                                return (
                                                    <div key={m.id || m.usuario?.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-slate-800 border border-slate-700">
                                                                <Shield className={`w-4 h-4 ${ehDono ? "text-amber-400" : m.papel === "EDITOR" ? "text-emerald-400" : "text-slate-400"
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-100">
                                                                    {m.usuario?.name || m.usuario?.nome || "Membro"}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400">{m.usuario?.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded border ${ehDono
                                                                ? "bg-amber-950/80 border-amber-600 text-amber-300"
                                                                : m.papel === "EDITOR"
                                                                    ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                                                                    : "bg-slate-800 border-slate-600 text-slate-300"
                                                                }`}>
                                                                {m.papel}
                                                            </span>

                                                            {souDonoDaCarteiraAtiva() && !ehDono && (
                                                                <div className="flex items-center gap-1.5 ml-2">
                                                                    <select
                                                                        value={m.papel}
                                                                        onChange={(e) => handleAlterarPapel(m.usuario.id, e.target.value)}
                                                                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 cursor-pointer"
                                                                    >
                                                                        <option value="EDITOR">EDITOR</option>
                                                                        <option value="VISUALIZADOR">VISUALIZADOR</option>
                                                                    </select>
                                                                    <button
                                                                        onClick={() => handleRemoverMembro(m.usuario.id)}
                                                                        title="Remover Membro"
                                                                        className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-sm">
                            Selecione uma carteira ao lado para gerenciar seus membros.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Criação de Nova Carteira */}
            {modalNovaCarteira && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-400" /> Nova Carteira
                            </h2>
                            <button onClick={() => setModalNovaCarteira(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCriarCarteira} className="space-y-4">
                            <div>
                                <Label htmlFor="nome" className="text-slate-300 text-xs font-semibold">Nome da Carteira</Label>
                                <Input
                                    id="nome"
                                    type="text"
                                    value={nomeCarteira}
                                    onChange={(e) => setNomeCarteira(e.target.value)}
                                    placeholder="Ex: Família, Empresa, Viagem de Férias"
                                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="desc" className="text-slate-300 text-xs font-semibold">Descrição (Opcional)</Label>
                                <Input
                                    id="desc"
                                    type="text"
                                    value={descCarteira}
                                    onChange={(e) => setDescCarteira(e.target.value)}
                                    placeholder="Ex: Carteira compartilhada para gastos do mês"
                                    className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setModalNovaCarteira(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-700"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={enviandoNova}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                >
                                    {enviandoNova ? "Criando..." : "Criar Carteira"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Carteiras;
