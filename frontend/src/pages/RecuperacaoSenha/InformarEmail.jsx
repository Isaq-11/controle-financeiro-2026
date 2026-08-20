import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight } from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validarEmail } from "@/utils/validarForm";
import api from "@/configs/axiosConfig";

const InformarEmail = () => {
    const [email, setEmail] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [mensagemNeutra, setMensagemNeutra] = useState("");
    const [debugToken, setDebugToken] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    const solicitarCodigo = async (e) => {
        e.preventDefault();

        setErroEmail("");
        setMensagemNeutra("");
        setDebugToken("");

        const msgErro = validarEmail(email);
        if (msgErro) {
            setErroEmail(msgErro);
            return;
        }

        setCarregando(true);

        try {
            // Chamada à API Backend (/auth/forgot-password)
            const response = await api.post("/auth/forgot-password", { email });
            const data = response.data;

            setMensagemNeutra(data.message || "Se este e-mail estiver cadastrado, você receberá as instruções em breve.");

            if (data.debugToken || data.token) {
                const tokenGerado = data.debugToken || data.token;
                setDebugToken(tokenGerado);
            }

            // Redireciona para validação após 3.5 segundos se não clicar no token
            setTimeout(() => {
                if (data.debugToken || data.token) {
                    navigate(`/redefinir-senha/${data.debugToken || data.token}`);
                } else {
                    navigate("/redefinicao-senha/validacao-codigo");
                }
            }, 3500);
        } catch {
            // Mensagem neutra de segurança conforme requisito (PDF 1 Seção 4 / PDF 2 Seção 5.1)
            setMensagemNeutra("Se este e-mail estiver cadastrado, você receberá as instruções em breve.");
            setTimeout(() => {
                navigate("/redefinicao-senha/validacao-codigo");
            }, 3000);
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
                        Etapa 1: Informe seu e-mail para receber o token de redefinição
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col space-y-6">
                    {/* Mensagem Neutra de Confirmação (Conforme especificado no PDF 2) */}
                    {mensagemNeutra && (
                        <div className="p-3.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-sm font-medium text-center space-y-2">
                            <p>{mensagemNeutra}</p>
                            {debugToken && (
                                <div className="pt-2 border-t border-slate-800 flex flex-col items-center gap-2">
                                    <span className="text-xs text-amber-400 font-semibold">
                                        Token de Teste Gerado: <code className="bg-slate-950 px-2 py-1 rounded text-emerald-400">{debugToken}</code>
                                    </span>
                                    <Button
                                        size="sm"
                                        onClick={() => navigate(`/redefinir-senha/${debugToken}`)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                                    >
                                        Ir para Redefinição com Token <ArrowRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
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
                                {carregando ? "Enviando Solicitação..." : "Solicitar Redefinição"}
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