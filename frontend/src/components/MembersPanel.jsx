import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField, InlineSelect } from "@/components/ui/field";
import { RoleBadge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/ui/feedback";
import { inicial, nomeDoUsuario } from "@/lib/format";

// Lista e gestão de membros. Recebe o resultado de useWalletMembers.
// Só o dono vê o convite e os controles de permissão.
export default function MembersPanel({ api, ehDono }) {
    const [email, setEmail] = useState("");
    const [papel, setPapel] = useState("EDITOR");
    const { membros, carregando, enviando, erro, sucesso, adicionar, alterarPapel, remover } = api;

    const convidar = async (e) => {
        e.preventDefault();
        if (await adicionar({ email, papel })) setEmail("");
    };

    return (
        <div className="stack stack--lg">
            {erro && <Alert>{erro}</Alert>}
            {sucesso && <Alert tone="success">{sucesso}</Alert>}

            {ehDono && (
                <form onSubmit={convidar} className="stack stack--sm" noValidate>
                    <div className="cluster" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
                        <TextField
                            label="Convidar por e-mail"
                            type="email"
                            inputMode="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="pessoa@email.com"
                            className="members__email"
                            style={{ flex: "1 1 14rem" }}
                        />
                        <div className="field" style={{ flex: "0 1 11rem" }}>
                            <label className="field__label" htmlFor="papel-novo">Permissão</label>
                            <InlineSelect small={false} id="papel-novo" value={papel} onChange={(e) => setPapel(e.target.value)}>
                                <option value="EDITOR">Editor</option>
                                <option value="VISUALIZADOR">Visualizador</option>
                            </InlineSelect>
                        </div>
                        <Button type="submit" loading={enviando}>
                            <UserPlus className="icon" aria-hidden="true" /> Convidar
                        </Button>
                    </div>
                    <p className="field__hint">Editores lançam transações; visualizadores só consultam.</p>
                </form>
            )}

            {carregando ? (
                <LoadingState label="Carregando membros..." />
            ) : membros.length === 0 ? (
                <EmptyState title="Nenhum membro ainda">Convide alguém por e-mail para compartilhar esta carteira.</EmptyState>
            ) : (
                <ul className="members">
                    {membros.map((m) => {
                        const nome = nomeDoUsuario(m.usuario);
                        const podeEditar = ehDono && m.papel !== "DONO";
                        return (
                            <li key={m.id || m.usuario?.id} className="member">
                                <div className="member__who">
                                    <span className="avatar">{inicial(nome)}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <p className="truncate" style={{ fontWeight: 600 }}>{nome}</p>
                                        <p className="truncate muted small">{m.usuario?.email}</p>
                                    </div>
                                </div>
                                <div className="member__controls">
                                    {podeEditar ? (
                                        <>
                                            <InlineSelect
                                                aria-label={`Permissão de ${nome}`}
                                                value={m.papel}
                                                onChange={(e) => alterarPapel(m.usuario.id, e.target.value)}
                                            >
                                                <option value="EDITOR">Editor</option>
                                                <option value="VISUALIZADOR">Visualizador</option>
                                            </InlineSelect>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                icon
                                                aria-label={`Remover ${nome}`}
                                                onClick={() => remover(m.usuario.id, nome)}
                                            >
                                                <Trash2 className="icon icon--sm" />
                                            </Button>
                                        </>
                                    ) : (
                                        <RoleBadge papel={m.papel} />
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
