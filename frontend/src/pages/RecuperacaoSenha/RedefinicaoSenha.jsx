import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { PasswordField } from "@/components/forms/PasswordField";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { validarSenha, confirmarSenha } from "@/utils/validarForm";
import api from "@/configs/axiosConfig";

const RedefinicaoSenha = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    const redefinir = async (e) => {
        e.preventDefault();
        setErroGeral("");
        setSucesso("");

        if (!token?.trim()) {
            setErroGeral("O código não foi encontrado. Volte e solicite um novo.");
            return;
        }

        const novos = { nova: validarSenha(novaSenha), confirmacao: confirmarSenha(novaSenha, confirmacao) };
        setErros(novos);
        if (novos.nova || novos.confirmacao) return;

        setCarregando(true);
        try {
            const { data } = await api.post("/auth/reset-password", { token, newPassword: novaSenha });
            setSucesso(data?.message || "Senha redefinida! Levando você para o login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setErroGeral(
                err.response?.data?.mensagem ||
                err.response?.data?.message ||
                "O código expirou ou é inválido. Solicite um novo."
            );
        } finally {
            setCarregando(false);
        }
    };

    return (
        <AuthLayout
            title="Nova senha"
            subtitle="Escolha uma senha que você ainda não usou."
            step={3}
            totalSteps={3}
            footer={<Link to="/login">Voltar para o login</Link>}
        >
            {erroGeral && <Alert>{erroGeral}</Alert>}
            {sucesso && <Alert tone="success">{sucesso}</Alert>}
            <form onSubmit={redefinir} className="stack" noValidate>
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
                <Button type="submit" block loading={carregando}>
                    Redefinir senha
                </Button>
            </form>
        </AuthLayout>
    );
};

export default RedefinicaoSenha;
