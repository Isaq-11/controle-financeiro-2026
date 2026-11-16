import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { PasswordField } from "@/components/forms/PasswordField";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { validarEmail, validarSenha } from "@/utils/validarForm";
import { useAuth } from "@/services/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [erroSenha, setErroSenha] = useState("");
    const [erroGeral, setErroGeral] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();
    const { realizarLogin } = useAuth();

    const tentarLogar = async (e) => {
        e.preventDefault();
        setErroGeral("");

        const msgEmail = validarEmail(email);
        const msgSenha = validarSenha(senha);
        setErroEmail(msgEmail);
        setErroSenha(msgSenha);
        if (msgEmail || msgSenha) return;

        setCarregando(true);
        try {
            await realizarLogin(email, senha);
            navigate("/dashboard");
        } catch (error) {
            setErroGeral(error.message || "Não foi possível entrar. Confira seus dados.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <AuthLayout
            title="Entrar"
            subtitle="Acesse suas carteiras e acompanhe seus gastos."
            footer={
                <>
                    Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
                </>
            }
        >
            {erroGeral && <Alert>{erroGeral}</Alert>}

            <form onSubmit={tentarLogar} className="stack" noValidate>
                <TextField
                    label="E-mail"
                    type="email"
                    icon={Mail}
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={erroEmail}
                    placeholder="voce@email.com"
                />
                <div className="stack stack--sm">
                    <PasswordField
                        label="Senha"
                        autoComplete="current-password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        error={erroSenha}
                    />
                    <Link to="/redefinicao-senha/informar-email" className="small link" style={{ alignSelf: "flex-end" }}>
                        Esqueci minha senha
                    </Link>
                </div>
                <Button type="submit" block loading={carregando}>
                    Entrar
                </Button>
            </form>
        </AuthLayout>
    );
};

export default Login;
