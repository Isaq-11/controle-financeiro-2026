import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    Brain,
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    RefreshCw,
    KeyRound,
    ExternalLink,
    ShieldCheck,
    Copy,
    Check,
    HelpCircle,
    X,
    TrendingUp,
    Info
} from "lucide-react";
import AiService from "@/services/AiService";

const aiService = new AiService();

const AiInsightsCard = ({ walletId, startDate, endDate, tituloPeriodo }) => {
    const [carregando, setCarregando] = useState(false);
    const [insights, setInsights] = useState(null);
    const [erro, setErro] = useState("");
    const [modalGuiaAberto, setModalGuiaAberto] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const aoGerarInsights = async () => {
        if (!walletId) return;

        setCarregando(true);
        setErro("");

        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const resultado = await aiService.gerarInsights(walletId, params);
            setInsights(resultado);

            if (resultado.status === "ERRO") {
                setErro(resultado.mensagem || "Não foi possível gerar a análise.");
            }
        } catch (err) {
            console.error("Erro ao solicitar insights com IA:", err);
            const msg = err.response?.data?.message || err.response?.data?.mensagem || "Falha na comunicação com o servidor.";
            setErro(msg);
        } finally {
            setCarregando(false);
        }
    };

    const copiarTextoExemplo = () => {
        navigator.clipboard.writeText("gemini.api.key=SUA_CHAVE_AQUI");
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
    };

    // Cores e estilos do score de saúde financeira
    const obterEstiloStatus = (status, score) => {
        if (score >= 80 || status === "Excelente") {
            return {
                badge: "bg-emerald-950/70 text-emerald-400 border-emerald-600/50",
                barra: "bg-emerald-500",
                texto: "text-emerald-400",
                borda: "border-emerald-500/30"
            };
        }
        if (score >= 60 || status === "Saudável") {
            return {
                badge: "bg-teal-950/70 text-teal-400 border-teal-600/50",
                barra: "bg-teal-500",
                texto: "text-teal-400",
                borda: "border-teal-500/30"
            };
        }
        if (score >= 40 || status === "Atenção") {
            return {
                badge: "bg-amber-950/70 text-amber-400 border-amber-600/50",
                barra: "bg-amber-500",
                texto: "text-amber-400",
                borda: "border-amber-500/30"
            };
        }
        return {
            badge: "bg-rose-950/70 text-rose-400 border-rose-600/50",
            barra: "bg-rose-500",
            texto: "text-rose-400",
            borda: "border-rose-500/30"
        };
    };

    return (
        <>
            <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 shadow-xl overflow-hidden print:hidden">
                {/* Topo do Card de IA */}
                <div className="p-4 md:p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-100 text-base md:text-lg">
                                    Insights Inteligentes com IA
                                </h3>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/50">
                                    Gemini 1.5 Flash • Gratuito
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Parecer executivo consultivo baseado no fluxo de caixa e hábitos da carteira
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setModalGuiaAberto(true)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
                            title="Como configurar a chave gratuita do Gemini"
                        >
                            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="hidden sm:inline">Configurar Chave</span>
                        </button>

                        <Button
                            onClick={aoGerarInsights}
                            disabled={carregando}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-4 gap-2 shadow-lg shadow-indigo-950/50"
                        >
                            {carregando ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Analisando dados...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    <span>{insights ? "Atualizar Diagnóstico" : "Gerar Diagnóstico com IA"}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Conteúdo Dinâmico */}
                <CardContent className="p-4 md:p-6 space-y-5">
                    {/* Caso 1: Ainda não clicou para gerar */}
                    {!insights && !carregando && !erro && (
                        <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                <Brain className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm md:text-base font-semibold text-slate-200">
                                Obtenha uma análise profissional da sua saúde financeira em segundos
                            </h4>
                            <p className="text-xs text-slate-400 max-w-xl mx-auto">
                                Clique no botão acima para acionar o Google Gemini. O modelo examinará o equilíbrio entre receitas e despesas, o ritmo diário de gastos e a divisão entre membros para sugerir passos práticos para economizar.
                            </p>
                        </div>
                    )}

                    {/* Caso 2: Em carregamento */}
                    {carregando && (
                        <div className="p-8 rounded-2xl bg-slate-950/50 border border-slate-800 text-center space-y-4">
                            <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-200">
                                    Processando diagnóstico com Google Gemini...
                                </h4>
                                <p className="text-xs text-slate-400 mt-1">
                                    Avaliando taxa de poupança, despesas por categoria e elaborando recomendações personalizadas.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Caso 3: Chave de API não configurada */}
                    {insights?.status === "CONFIGURACAO_PENDENTE" && (
                        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200 space-y-3">
                            <div className="flex items-start gap-3">
                                <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-amber-300">
                                        Chave Gratuita da API do Gemini Não Configurada
                                    </h4>
                                    <p className="text-xs text-amber-200/90 leading-relaxed">
                                        {insights.mensagem}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-amber-600/20">
                                <button
                                    onClick={() => setModalGuiaAberto(true)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Ver Passo a Passo Seguro (Custo ZERO)
                                </button>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1 underline underline-offset-2"
                                >
                                    Abrir Google AI Studio <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Caso 4: Sem dados no período */}
                    {insights?.status === "SEM_DADOS" && (
                        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-3">
                            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
                            <p className="text-xs text-slate-300">
                                {insights.mensagem}
                            </p>
                        </div>
                    )}

                    {/* Caso 5: Erro */}
                    {erro && (
                        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{erro}</span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={aoGerarInsights}
                                className="text-xs border-rose-700 text-rose-200 hover:bg-rose-900/50 h-7"
                            >
                                Tentar Novamente
                            </Button>
                        </div>
                    )}

                    {/* Caso 6: Sucesso - Exibição Completa do Parecer de IA */}
                    {insights?.status === "SUCESSO" && (() => {
                        const estilo = obterEstiloStatus(insights.statusSaude, insights.scoreSaudeFinanceira);

                        return (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                {/* Header do Diagnóstico com Score e Resumo */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 md:p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                                    {/* Medidor de Score */}
                                    <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                                                Saúde Financeira
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${estilo.badge}`}>
                                                {insights.statusSaude || "Saudável"}
                                            </span>
                                        </div>

                                        <div className="flex items-baseline gap-2 my-2">
                                            <span className={`text-4xl font-black ${estilo.texto}`}>
                                                {insights.scoreSaudeFinanceira || 75}
                                            </span>
                                            <span className="text-xs text-slate-400 font-semibold">/ 100 pontos</span>
                                        </div>

                                        {/* Barra de Progresso do Score */}
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                                            <div
                                                className={`h-full ${estilo.barra} transition-all duration-700`}
                                                style={{ width: `${Math.min(Math.max(insights.scoreSaudeFinanceira || 75, 5), 100)}%` }}
                                            />
                                        </div>

                                        <p className="text-[11px] text-slate-400 mt-3">
                                            {insights.mensagemDestaque || "Diagnóstico calculado a partir de taxa de poupança e fluxo de caixa."}
                                        </p>
                                    </div>

                                    {/* Resumo Executivo */}
                                    <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="w-4 h-4 text-indigo-400" />
                                                <h4 className="text-sm font-bold text-slate-100">
                                                    {insights.titulo || "Parecer Executivo"}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {insights.resumoExecutivo}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800/80 mt-3">
                                            <span>Modelo: {insights.modelo || "gemini-1.5-flash"}</span>
                                            <span>
                                                Gerado em: {new Date(insights.geradoEm || Date.now()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Grid de Análise em 3 Colunas */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Coluna 1: Pontos Fortes */}
                                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-600/30 space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            <h5 className="font-bold text-xs uppercase tracking-wider">Pontos Fortes</h5>
                                        </div>
                                        <ul className="space-y-2">
                                            {insights.pontosPositivos?.map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                                    <span className="text-emerald-400 text-sm font-bold shrink-0">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                            {(!insights.pontosPositivos || insights.pontosPositivos.length === 0) && (
                                                <li className="text-xs text-slate-400 italic">Nenhum ponto forte identificado.</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Coluna 2: Pontos de Atenção */}
                                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-600/30 space-y-3">
                                        <div className="flex items-center gap-2 text-amber-400">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            <h5 className="font-bold text-xs uppercase tracking-wider">Pontos de Atenção</h5>
                                        </div>
                                        <ul className="space-y-2">
                                            {insights.pontosAtencao?.map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                                    <span className="text-amber-400 text-sm font-bold shrink-0">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                            {(!insights.pontosAtencao || insights.pontosAtencao.length === 0) && (
                                                <li className="text-xs text-slate-400 italic">Nenhum ponto de risco crítico identificado.</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Coluna 3: Recomendações Práticas */}
                                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-600/30 space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Lightbulb className="w-4 h-4 shrink-0" />
                                            <h5 className="font-bold text-xs uppercase tracking-wider">Recomendações Práticas</h5>
                                        </div>
                                        <ul className="space-y-2">
                                            {insights.recomendacoes?.map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                                    <span className="text-indigo-400 text-sm font-bold shrink-0">{idx + 1}.</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                            {(!insights.recomendacoes || insights.recomendacoes.length === 0) && (
                                                <li className="text-xs text-slate-400 italic">Nenhuma recomendação registrada.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* Modal de Ajuda / Passo a Passo de Configuração Segura */}
            {modalGuiaAberto && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
                        <button
                            onClick={() => setModalGuiaAberto(false)}
                            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-600/50 flex items-center justify-center text-indigo-400">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-slate-100">
                                    Configuração da Chave da API Gemini (Custo R$ 0,00)
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Segurança garantida: chave mantida no backend e ignorada no Git
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs text-slate-300">
                            {/* Passo 1 */}
                            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                                <div className="font-semibold text-indigo-300 flex items-center justify-between">
                                    <span>1. Gerar Chave Gratuita no Google AI Studio</span>
                                    <span className="text-[10px] bg-indigo-900/40 px-2 py-0.5 rounded text-indigo-300">Sem Cartão</span>
                                </div>
                                <p className="text-slate-400">
                                    Acesse o portal oficial do Google e clique em <strong className="text-slate-200">"Create API key"</strong>:
                                </p>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
                                >
                                    https://aistudio.google.com/app/apikey <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            {/* Passo 2 */}
                            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                                <div className="font-semibold text-emerald-300">
                                    2. Onde salvar a chave com segurança?
                                </div>
                                <p className="text-slate-400">
                                    Para seguir as melhores práticas e <strong>NUNCA comitar sua chave no GitHub</strong>, salve-a no arquivo local de segredos do backend:
                                </p>
                                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 break-all">
                                    backend/src/main/resources/application-secrets.properties
                                </div>
                                <p className="text-slate-400">
                                    Cole a linha com sua chave dentro desse arquivo:
                                </p>
                                <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400">
                                    <span>gemini.api.key=AIzaSy...sua_chave...</span>
                                    <button
                                        type="button"
                                        onClick={copiarTextoExemplo}
                                        className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1"
                                    >
                                        {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiado ? "Copiado!" : "Copiar"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Passo 3 */}
                            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                                <div className="font-semibold text-cyan-300">
                                    3. Alternativa via Variável de Ambiente
                                </div>
                                <p className="text-slate-400">
                                    Se preferir, defina no terminal ou sistema operacional:
                                </p>
                                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                                    set GEMINI_API_KEY=AIzaSy... (Windows CMD)<br />
                                    $env:GEMINI_API_KEY="AIzaSy..." (PowerShell)
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                            <Button
                                variant="outline"
                                onClick={() => setModalGuiaAberto(false)}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                            >
                                Entendi, Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiInsightsCard;

