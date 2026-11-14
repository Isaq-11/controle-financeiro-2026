import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
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
            toast.success("Senha alterada.");
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
        <>
            <PageHeader title="Alterar senha" subtitle="Informe a senha atual para confirmar que a conta é sua." />
            <Card style={{ maxWidth: "28rem" }}>
                <form onSubmit={salvar} className="stack" noValidate>
                    {erroGeral && <Alert>{erroGeral}</Alert>}
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
                    />
                    <PasswordField
                        label="Confirmar nova senha"
                        autoComplete="new-password"
                        value={confirmacao}
                        onChange={(e) => setConfirmacao(e.target.value)}
                        error={erros.confirmacao}
                    />
                    <div>
                        <Button type="submit" loading={carregando}>
                            Salvar nova senha
                        </Button>
                    </div>
                </form>
            </Card>
        </>
    );
};

export default AlteracaoSenha;
