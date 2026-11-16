import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { validarEmail } from "@/utils/validarForm";
import api from "@/configs/axiosConfig";

const MENSAGEM_NEUTRA = "Se este e-mail estiver cadastrado, você receberá as instruções em breve.";

const InformarEmail = () => {
    const [email, setEmail] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    const solicitarCodigo = async (e) => {
        e.preventDefault();
        setMensagem("");

        const erro = validarEmail(email);
        setErroEmail(erro);
        if (erro) return;

        setCarregando(true);
        try {
            const { data } = await api.post("/auth/forgot-password", { email });
            setMensagem(data?.message || MENSAGEM_NEUTRA);
        } catch {
            // Resposta neutra: não revela se o e-mail existe (boa prática OWASP).
            setMensagem(MENSAGEM_NEUTRA);
        } finally {
            setCarregando(false);
            setTimeout(() => navigate("/redefinicao-senha/validacao-codigo"), 2500);
        }
    };

    return (
        <AuthLayout
            title="Recuperar senha"
            subtitle="Enviaremos um código de 6 dígitos para o seu e-mail."
            step={1}
            totalSteps={3}
            footer={<Link to="/login">Voltar para o login</Link>}
        >
            {mensagem && <Alert tone="info">{mensagem}</Alert>}
            <form onSubmit={solicitarCodigo} className="stack" noValidate>
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
                <Button type="submit" block loading={carregando} disabled={!!mensagem}>
                    Enviar código
                </Button>
            </form>
        </AuthLayout>
    );
};

export default InformarEmail;
