import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PasswordField } from "@/components/forms/PasswordField";
import { useToast } from "@/components/ui/feedback-provider";
import { validarSenha, confirmarSenha } from "@/utils/validarForm";
import { useAuth } from "@/services/AuthContext";

const AlteracaoSenha = () => {
    const { alterarSenhaAtual } = useAuth();
    const toast = useToast();

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState("");
    const [carregando, setCarregando] = useState(false);

    const salvar = async (e) => {
        e.preventDefault();
        setErroGeral("");

        const novos = {
            atual: senhaAtual ? "" : "Informe a senha atual",
            nova: validarSenha(novaSenha),
            confirmacao: confirmarSenha(novaSenha, confirmacao),
        };
        setErros(novos);
        if (Object.values(novos).some(Boolean)) return;

        setCarregando(true);
        try {
            await alterarSenhaAtual(senhaAtual, novaSenha);
            toast.success("Senha alterada com sucesso.");
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmacao("");
        } catch (error) {
            setErroGeral(error.message || "Não foi possível alterar a senha. Confira a senha atual.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 12rem)", padding: "var(--s-4) 0" }}>
            <div className="auth__panel">
                <div className="card stack stack--lg">
                    <div>
                        <h1 className="auth__title">Alterar senha</h1>
                        <p className="auth__sub">Informe a senha atual para confirmar que a conta é sua e defina uma nova senha.</p>
                    </div>

                    {erroGeral && <Alert>{erroGeral}</Alert>}

                    <form onSubmit={salvar} className="stack" noValidate>
                        <PasswordField
                            label="Senha atual"
                            autoComplete="current-password"
                            value={senhaAtual}
                            onChange={(e) => setSenhaAtual(e.target.value)}
                            error={erros.atual}
                        />
                        <PasswordField
                            label="Nova senha"
                            autoComplete="new-password"
                            showStrength
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            error={erros.nova}
                            hint="Mínimo de 6 caracteres."
                        />
                        <PasswordField
                            label="Confirmar nova senha"
                            autoComplete="new-password"
                            value={confirmacao}
                            onChange={(e) => setConfirmacao(e.target.value)}
                            error={erros.confirmacao}
                        />
                        <Button type="submit" block loading={carregando}>
                            Salvar nova senha
                        </Button>
                    </form>
                </div>

                <p className="auth__foot">
                    <Link to="/dashboard" className="link" style={{ display: "inline-flex", alignItems: "center", gap: "var(--s-1)" }}>
                        <ArrowLeft className="icon icon--sm" aria-hidden="true" /> Voltar ao Painel
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AlteracaoSenha;
