import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatarData, formatarDinheiro, nomeDoUsuario } from "@/lib/format";

// Lista de lançamentos usada no Painel e no extrato dos Relatórios.
// Substitui duas tabelas de 6 colunas: no celular a tabela exigia rolagem lateral,
// agora cada linha mostra descrição, valor e uma linha de detalhes.
// Recebe a transação como vem da API (categoria, criadoPor, atualizadoPor em objetos).
export default function TransactionLedger({ itens, usuarioId, onEditar, onExcluir, rodape }) {
    return (
        <div>
            <ul className="ledger">
                {itens.map((t) => {
                    const receita = t.tipo === "RECEITA";
                    const autor = t.criadoPor?.id === usuarioId ? "Você" : nomeDoUsuario(t.criadoPor);
                    const editouOutro = t.atualizadoPor && t.atualizadoPor.id !== t.criadoPor?.id;
                    const editor = t.atualizadoPor?.id === usuarioId ? "você" : nomeDoUsuario(t.atualizadoPor);
                    const meta = [t.categoria?.nome || "Sem categoria", formatarData(t.data), autor];

                    return (
                        <li key={t.id} className="ledger__row">
                            <span className="ledger__dot" style={t.categoria?.cor ? { background: t.categoria.cor } : undefined} aria-hidden="true" />
                            <div style={{ minWidth: 0 }}>
                                <p className="ledger__title truncate">{t.descricao}</p>
                                <p className="ledger__meta truncate">
                                    {meta.join(" · ")}
                                    {editouOutro && ` · editado por ${editor}`}
                                </p>
                            </div>
                            <span className={cn("ledger__amount num", receita ? "is-income" : "is-expense")}>
                                <span className="sr-only">{receita ? "Receita" : "Despesa"} </span>
                                {receita ? "+" : "−"} {formatarDinheiro(t.valor)}
                            </span>
                            {(onEditar || onExcluir) && (
                                <div className="ledger__actions">
                                    {onEditar && (
                                        <Button variant="ghost" size="sm" icon aria-label={`Editar ${t.descricao}`} onClick={() => onEditar(t)}>
                                            <Pencil className="icon icon--sm" />
                                        </Button>
                                    )}
                                    {onExcluir && (
                                        <Button variant="danger" size="sm" icon aria-label={`Excluir ${t.descricao}`} onClick={() => onExcluir(t)}>
                                            <Trash2 className="icon icon--sm" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
            {rodape && <div className="ledger__foot">{rodape}</div>}
        </div>
    );
}
