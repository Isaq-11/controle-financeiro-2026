import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Lightbulb, Sparkles } from "lucide-react";
import AiService from "@/services/AiService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { mensagemDeErro } from "@/lib/format";

const aiService = new AiService();

// Cor do medidor conforme a nota (mesmas faixas de antes).
const corDoScore = (score, status) => {
    if (score >= 80 || status === "Excelente") return "var(--income)";
    if (score >= 60 || status === "Saudável") return "var(--income)";
    if (score >= 40 || status === "Atenção") return "var(--warning)";
    return "var(--expense)";
};

function Lista({ titulo, icone: Icone, itens, vazio, cor, numerada }) {
    return (
        <div>
            <h4 className="insights__title">
                <Icone className="icon icon--sm" style={{ color: cor }} aria-hidden="true" /> {titulo}
            </h4>
            {itens?.length ? (
                <ul className="insight-list" style={{ "--dot": cor }}>
                    {itens.map((item, i) => (
                        <li key={i}>
                            {numerada && <span className="muted num">{i + 1}.</span>}
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="muted small">{vazio}</p>
            )}
        </div>
    );
}

// Diagnóstico gerado por IA para a carteira (e período, quando informado).
// Mantém os diagnósticos em cache por carteira para que não se misturem nem se percam na troca.
const AiInsightsCard = ({ walletId, startDate, endDate, tituloPeriodo }) => {
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [guiaAberto, setGuiaAberto] = useState(false);

    // Cache de diagnósticos por ID da carteira persistido na sessão
    const [cachePorCarteira, setCachePorCarteira] = useState(() => {
        try {
            const salvo = sessionStorage.getItem("ai_insights_cache");
            return salvo ? JSON.parse(salvo) : {};
        } catch {
            return {};
        }
    });

    const chaveCarteira = walletId ? String(walletId) : "";
    const insights = chaveCarteira ? cachePorCarteira[chaveCarteira] || null : null;

    // Ao trocar a carteira selecionada, reseta mensagens de erro anteriores
    useEffect(() => {
        setErro("");
    }, [walletId]);

    const gerar = async () => {
        if (!walletId) return;
        setCarregando(true);
        setErro("");
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const resultado = await aiService.gerarInsights(walletId, params);

            if (resultado.status === "ERRO") {
                setErro(resultado.mensagem || "Não foi possível gerar a análise.");
            } else {
                setCachePorCarteira((prev) => {
                    const novo = { ...prev, [String(walletId)]: resultado };
                    try {
                        sessionStorage.setItem("ai_insights_cache", JSON.stringify(novo));
                    } catch {
                        // ignore quota error
                    }
                    return novo;
                });
            }
        } catch (err) {
            setErro(mensagemDeErro(err, "Falha na comunicação com o servidor."));
        } finally {
            setCarregando(false);
        }
    };

    const score = insights?.scoreSaudeFinanceira ?? 0;

    return (
        <Card className="ai" aria-busy={carregando}>
            <div className="card__header">
                <div className="cluster" style={{ flexWrap: "nowrap", gap: "var(--s-3)" }}>
                    <span className="ai__icon">
                        <Sparkles className="icon" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="card__title">Análise com IA</h2>
                        <p className="card__sub">{tituloPeriodo ? `Período: ${tituloPeriodo}` : "Diagnóstico dos seus hábitos de gasto"}</p>
                    </div>
                </div>
                <Button variant={insights ? "secondary" : "primary"} onClick={gerar} loading={carregando} disabled={!walletId}>
                    {carregando ? "Analisando..." : insights?.status === "SUCESSO" ? "Atualizar" : "Gerar análise"}
                </Button>
            </div>

            {!insights && !carregando && !erro && (
                <p className="muted">
                    A IA avalia receitas, despesas e ritmo de gastos e sugere próximos passos. Os dados são enviados só no momento em que você pede.
                </p>
            )}

            {erro && (
                <Alert action={<Button variant="secondary" size="sm" onClick={gerar}>Tentar de novo</Button>}>
                    {erro}
                </Alert>
            )}

            {insights?.status === "CONFIGURACAO_PENDENTE" && (
                <Alert
                    tone="warning"
                    action={<Button variant="secondary" size="sm" onClick={() => setGuiaAberto(true)}>Como configurar</Button>}
                >
                    A análise com IA ainda não está ativada neste servidor. {insights.mensagem}
                </Alert>
            )}

            {insights?.status === "SEM_DADOS" && <Alert tone="info">{insights.mensagem}</Alert>}

            {insights?.status === "SUCESSO" && (
                <div className="stack stack--lg">
                    <div className="insights" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))" }}>
                        <div className="ai__score">
                            <span className="muted small">Saúde financeira</span>
                            <span className="ai__score-value num">
                                {score}
                                <span className="muted small"> / 100</span>
                            </span>
                            <div className="meter" role="img" aria-label={`Nota ${score} de 100`}>
                                <span style={{ width: `${Math.min(Math.max(score, 3), 100)}%`, "--meter": corDoScore(score, insights.statusSaude) }} />
                            </div>
                            {insights.statusSaude && <Badge tone="ai">{insights.statusSaude}</Badge>}
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                            <h3 className="card__title">{insights.titulo || "Resumo"}</h3>
                            <p style={{ marginTop: "var(--s-2)" }}>{insights.resumoExecutivo}</p>
                        </div>
                    </div>

                    <div className="insights">
                        <Lista titulo="Pontos fortes" icone={CheckCircle2} cor="var(--income)" itens={insights.pontosPositivos} vazio="Nenhum ponto forte identificado." />
                        <Lista titulo="Atenção" icone={AlertTriangle} cor="var(--warning)" itens={insights.pontosAtencao} vazio="Nenhum risco relevante." />
                        <Lista titulo="Próximos passos" icone={Lightbulb} cor="var(--ai)" itens={insights.recomendacoes} vazio="Sem recomendações." numerada />
                    </div>

                    <p className="muted small">
                        Gerado por IA{insights.modelo ? ` (${insights.modelo})` : ""}{insights.geradoEm ? " às " : ""}
                        {insights.geradoEm && new Date(insights.geradoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}. Use como apoio, não como aconselhamento financeiro.
                    </p>
                </div>
            )}

            <Modal open={guiaAberto} onClose={() => setGuiaAberto(false)} title="Ativar a análise com IA" subtitle="Feito uma vez por quem administra o servidor">
                <ModalBody>
                    <ol className="stack" style={{ listStyle: "decimal", paddingLeft: "1.25rem" }}>
                        <li>
                            Crie uma chave gratuita no{" "}
                            <a className="link" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                                Google AI Studio <ExternalLink className="icon icon--sm" style={{ display: "inline" }} aria-hidden="true" />
                            </a>
                            .
                        </li>
                        <li>
                            No backend, adicione a chave ao arquivo de segredos (que fica fora do Git):
                            <div className="code" style={{ marginTop: "var(--s-2)" }}>
                                {"backend/src/main/resources/application-secrets.properties\ngemini.api.key=SUA_CHAVE"}
                            </div>
                        </li>
                        <li>
                            Ou defina a variável de ambiente <span className="code">GEMINI_API_KEY</span> e reinicie o servidor.
                        </li>
                    </ol>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => setGuiaAberto(false)}>Entendi</Button>
                </ModalFooter>
            </Modal>
        </Card>
    );
};

export default AiInsightsCard;
