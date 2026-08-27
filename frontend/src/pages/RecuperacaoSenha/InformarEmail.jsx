import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validarEmail } from "@/utils/validarForm";
import api from "@/configs/axiosConfig";

const InformarEmail = () => {
    const [email, setEmail] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [mensagemNeutra, setMensagemNeutra] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    const solicitarCodigo = async (e) => {
        e.preventDefault();

        setErroEmail("");
        setMensagemNeutra("");

        const msgErro = validarEmail(email);
        if (msgErro) {
            setErroEmail(msgErro);
            return;
        }

        setCarregando(true);

        try {
            // Envia requisição para a API (/auth/forgot-password) que envia o e-mail real com o código de 6 dígitos
            const response = await api.post("/auth/forgot-password", { email });
            const data = response.data;

            // Mensagem neutra de segurança conforme especificado nos PDFs (seção 4.1 e 5.1)
            setMensagemNeutra(data.message || "Se este e-mail estiver cadastrado, você receberá as instruções em breve.");

            // Redireciona obrigatoriamente para a Etapa 2 (digitar o código de 6 dígitos recebido por e-mail)
            setTimeout(() => {
                navigate("/redefinicao-senha/validacao-codigo");
            }, 2500);
        } catch {
            // Resposta neutra de segurança caso haja falha ou e-mail inexistente
            setMensagemNeutra("Se este e-mail estiver cadastrado, você receberá as instruções em breve.");
            setTimeout(() => {
                navigate("/redefinicao-senha/validacao-codigo");
            }, 2500);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-slate-950 p-4">
            <Card className="max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
                <CardHeader className="space-y-3 text-center">
                    <CardTitle className="text-3xl font-bold text-center text-slate-50">
                        Recuperar Senha
                    </CardTitle>
                    <CardDescription className="text-slate-200 text-base">
                        Etapa 1: Informe seu e-mail para receber o código de 6 dígitos
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col space-y-6">
                    {/* Mensagem Neutra de Confirmação de Segurança */}
                    {mensagemNeutra && (
                        <div className="p-4 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm font-medium text-center leading-relaxed">
                            {mensagemNeutra}
                        </div>
                    )}

                    <form onSubmit={solicitarCodigo}>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idEmail" className="text-slate-200 cursor-text">
                                    E-mail Cadastrado
                                </Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        id="idEmail"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Digite seu e-mail"
                                        className={`peer pl-8 bg-slate-700 text-slate-100 font-semibold ${
                                            erroEmail ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <Mail className="absolute left-3 w-4 text-slate-200 pointer-events-none" />
                                </div>
                                {erroEmail && <span className="text-xs text-rose-400 font-medium mt-1">{erroEmail}</span>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="submit"
                                disabled={carregando}
                                className="w-full bg-slate-900 hover:bg-slate-700 text-slate-100 font-bold h-11 border border-slate-600 transition-colors duration-150"
                            >
                                {carregando ? "Enviando Código por E-mail..." : "Enviar Código por E-mail"}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center text-sm border-t border-slate-700 pt-4">
                        <Link to="/login" className="font-bold text-slate-300 hover:text-slate-100 underline">
                            Voltar para o Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InformarEmail;