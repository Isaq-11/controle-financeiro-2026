import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { PasswordField } from "@/components/forms/PasswordField";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { validarEmail, validarSenha, confirmarSenha, validarNome } from "@/utils/validarForm";
import { useAuth } from "@/services/AuthContext";

const Cadastro = () => {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();
    const { realizarCadastro } = useAuth();

    const tentarCadastrar = async (e) => {
        e.preventDefault();
        setErroGeral("");
        setSucesso("");

        const novosErros = {
            nome: validarNome(nome),
            email: validarEmail(email),
            senha: validarSenha(senha),
            confirmacao: confirmarSenha(senha, confirmacao),
        };
        setErros(novosErros);
        if (Object.values(novosErros).some(Boolean)) return;

        setCarregando(true);
        try {
            await realizarCadastro(nome, email, senha);
            setSucesso("Conta criada! Levando você para o login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setErroGeral(error.message || "Não foi possível criar a conta.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <AuthLayout
            title="Criar conta"
            subtitle="Leva menos de um minuto."
            footer={
                <>
                    Já tem conta? <Link to="/login">Entrar</Link>
                </>
            }
        >
            {erroGeral && <Alert>{erroGeral}</Alert>}
            {sucesso && <Alert tone="success">{sucesso}</Alert>}

            <form onSubmit={tentarCadastrar} className="stack" noValidate>
                <TextField
                    label="Nome"
                    icon={User}
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    error={erros.nome}
                />
                <TextField
                    label="E-mail"
                    type="email"
                    icon={Mail}
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={erros.email}
                />
                <PasswordField
                    label="Senha"
                    autoComplete="new-password"
                    showStrength
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    error={erros.senha}
                    hint="Mínimo de 6 caracteres."
                />
                <PasswordField
                    label="Confirmar senha"
                    autoComplete="new-password"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    onBlur={() => setErros((a) => ({ ...a, confirmacao: confirmarSenha(senha, confirmacao) }))}
                    error={erros.confirmacao}
                />
                <Button type="submit" block loading={carregando}>
                    Criar conta
                </Button>
            </form>
        </AuthLayout>
    );
};

export default Cadastro;
