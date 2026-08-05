import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Importando utilitarios simples de validacao e autenticacao
import { validarEmail, validarSenha } from "@/utils/validarForm";
import { useAuth } from "@/services/AuthContext";

const Login = () => {
    // 1. ESTADOS DO FORMULARIO (Armazenam o que o usuario digita)
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    // 2. ESTADOS DE FEEDBACK VISUAL (Erros e Carregamento)
    const [erroEmail, setErroEmail] = useState("");
    const [erroSenha, setErroSenha] = useState("");
    const [mensagemErroGeral, setMensagemErroGeral] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const navigate = useNavigate();
    const { realizarLogin } = useAuth();

    // 3. FUNCAO EXECUTADA AO CLICAR NO BOTAO DE ENTRAR
    const tentarLogar = async (e) => {
        e.preventDefault(); // Impede a pagina de recarregar

        // Limpa erros anteriores
        setErroEmail("");
        setErroSenha("");
        setMensagemErroGeral("");

        // Valida cada campo usando nossas funcoes utilitarias
        const msgErroEmail = validarEmail(email);
        const msgErroSenha = validarSenha(senha);

        // Se houver algum erro de validacao, atualiza o estado e para a execucao
        if (msgErroEmail || msgErroSenha) {
            setErroEmail(msgErroEmail);
            setErroSenha(msgErroSenha);
            return;
        }

        // Se passou nas validaçoes, ativa o estado de carregamento (spinner/texto)
        setCarregando(true);

        try {
            // Tenta fazer o login no AuthContext (que simula chamada de API)
            await realizarLogin(email, senha);
            // Se der certo, redireciona o usuario para a tela principal (Dashboard)
            navigate("/dashboard");
        } catch (error) {
            // Se o login falhar (senha errada), mostra a mensagem sem apagar o que ele digitou
            setMensagemErroGeral(error.message || "Erro ao tentar logar. Verifique seus dados!");
        } finally {
            // Desativa o indicador de carregamento
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-slate-950 p-4">
            <Card className="max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
                <CardHeader className="space-y-3 text-center">
                    <CardTitle className="text-3xl font-bold text-center text-slate-50">
                        Bem-Vindo de Volta!
                    </CardTitle>

                    <CardDescription className="text-slate-200 text-base">
                        Faça Login para acessar sua Carteira
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col space-y-6">
                    {/* Mensagem de Erro Geral (Norma IHC: Vermelho/Rose apenas para alerta de falha) */}
                    {mensagemErroGeral && (
                        <div className="p-3 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-sm font-medium text-center">
                            {mensagemErroGeral}
                        </div>
                    )}

                    <form onSubmit={tentarLogar}>
                        <div className="flex flex-col gap-5">
                            
                            {/* Campo de E-mail */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idEmail" className="text-slate-200 cursor-text">
                                    E-mail
                                </Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        id="idEmail"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Digite seu e-mail"
                                        className={`peer pl-8 bg-slate-700 text-slate-100 font-semibold hover:border-slate-400 focus-within:bg-slate-700 focus-within:text-slate-100 transition-colors duration-150 ${
                                            erroEmail ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <Mail className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-100" />
                                </div>
                                {erroEmail && (
                                    <span className="text-xs text-rose-400 font-medium mt-1">{erroEmail}</span>
                                )}
                            </div>

                            {/* Campo de Senha */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idSenha" className="text-slate-200 cursor-text">
                                    Senha
                                </Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        id="idSenha"
                                        type={mostrarSenha ? "text" : "password"}
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        placeholder="Digite sua senha"
                                        className={`w-full pl-8 pr-12 peer bg-slate-700 text-slate-100 font-semibold hover:border-slate-400 focus-within:bg-slate-700 focus-within:text-slate-100 transition-colors duration-150 ${
                                            erroSenha ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-100" />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        className="absolute right-3 text-slate-200 hover:text-slate-400 peer-focus-within:text-slate-100"
                                    >
                                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {erroSenha && (
                                    <span className="text-xs text-rose-400 font-medium mt-1">{erroSenha}</span>
                                )}

                                <div className="flex justify-end mt-1">
                                    <Link
                                        to="/redefinicao-senha/informar-email"
                                        className="text-sm font-semibold text-slate-300 hover:text-slate-100 underline"
                                    >
                                        Esqueci minha senha
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Botao com Indicador de Carregamento */}
                        <div className="mt-6">
                            <Button
                                type="submit"
                                disabled={carregando}
                                className="w-full bg-slate-900 hover:bg-slate-700 text-slate-100 font-bold h-11 border border-slate-600 transition-colors duration-150"
                            >
                                {carregando ? "Aguarde, logando..." : "Entrar no Sistema"}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center text-sm text-slate-300 border-t border-slate-700 pt-4">
                        Não tem uma conta?{" "}
                        <Link to="/cadastro" className="font-bold text-slate-100 hover:underline">
                            Cadastre-se
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;