import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, LockKeyhole, User } from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Importando funcoes de validacao
import { validarEmail, validarSenha, confirmarSenha, validarNome, calcularForcaSenha } from "@/utils/validarForm";
import { useAuth } from "@/services/AuthContext";

const Cadastro = () => {
    // 1. ESTADOS DO FORMULARIO
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

    // 2. ESTADOS DE VALIDACAO E FEEDBACK VISUAL
    const [erroNome, setErroNome] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [erroSenha, setErroSenha] = useState("");
    const [erroConfirmacao, setErroConfirmacao] = useState("");
    const [mensagemErroGeral, setMensagemErroGeral] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const navigate = useNavigate();
    const { realizarCadastro } = useAuth();

    // Calcula a força da senha em tempo real conforme o usuario digita
    const infoForca = calcularForcaSenha(senha);

    // Validação Cross-field (ao sair do segundo campo de senha)
    const handleBlurConfirmacao = () => {
        const msg = confirmarSenha(senha, confirmacaoSenha);
        setErroConfirmacao(msg);
    };

    // 3. FUNCAO DE SUBMISSAO DO CADASTRO
    const tentarCadastrar = async (e) => {
        e.preventDefault();

        // Limpa mensagens anteriores
        setErroNome("");
        setErroEmail("");
        setErroSenha("");
        setErroConfirmacao("");
        setMensagemErroGeral("");
        setMensagemSucesso("");

        // Validações individuais
        const msgNome = validarNome(nome);
        const msgEmail = validarEmail(email);
        const msgSenha = validarSenha(senha);
        const msgConfirm = confirmarSenha(senha, confirmacaoSenha);

        if (msgNome || msgEmail || msgSenha || msgConfirm) {
            setErroNome(msgNome);
            setErroEmail(msgEmail);
            setErroSenha(msgSenha);
            setErroConfirmacao(msgConfirm);
            return;
        }

        setCarregando(true);

        try {
            // Tenta realizar o cadastro no sistema simulado
            await realizarCadastro(nome, email, senha);
            setMensagemSucesso("Cadastro realizado com sucesso! Redirecionando para login...");
            
            // Aguarda 2 segundos e redireciona para a tela de login
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setMensagemErroGeral(error.message || "Erro ao cadastrar usuário.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-slate-950 p-4">
            <Card className="max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
                <CardHeader className="space-y-3 text-center">
                    <CardTitle className="text-3xl font-bold text-center text-slate-50">
                        Criar Nova Conta
                    </CardTitle>
                    <CardDescription className="text-slate-200 text-base">
                        Preencha os dados abaixo para cadastrar-se no sistema
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col space-y-6">
                    {/* Alertas visuais seguindo normas de IHC (Verde para sucesso, Vermelho para erro) */}
                    {mensagemErroGeral && (
                        <div className="p-3 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-sm font-medium text-center">
                            {mensagemErroGeral}
                        </div>
                    )}

                    {mensagemSucesso && (
                        <div className="p-3 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm font-medium text-center">
                            {mensagemSucesso}
                        </div>
                    )}

                    <form onSubmit={tentarCadastrar}>
                        <div className="flex flex-col gap-4">
                            
                            {/* Campo Nome Completo */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idNome" className="text-slate-200 cursor-text">
                                    Nome Completo
                                </Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        id="idNome"
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Digite seu nome completo"
                                        className={`peer pl-8 bg-slate-700 text-slate-100 font-semibold ${
                                            erroNome ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <User className="absolute left-3 w-4 text-slate-200 pointer-events-none" />
                                </div>
                                {erroNome && <span className="text-xs text-rose-400 font-medium mt-1">{erroNome}</span>}
                            </div>

                            {/* Campo E-mail */}
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
                                        className={`peer pl-8 bg-slate-700 text-slate-100 font-semibold ${
                                            erroEmail ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <Mail className="absolute left-3 w-4 text-slate-200 pointer-events-none" />
                                </div>
                                {erroEmail && <span className="text-xs text-rose-400 font-medium mt-1">{erroEmail}</span>}
                            </div>

                            {/* Campo Senha */}
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
                                        className={`w-full pl-8 pr-12 peer bg-slate-700 text-slate-100 font-semibold ${
                                            erroSenha ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none" />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        className="absolute right-3 text-slate-200 hover:text-slate-400"
                                    >
                                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {erroSenha && <span className="text-xs text-rose-400 font-medium mt-1">{erroSenha}</span>}

                                {/* Indicador Visual de Força da Senha */}
                                {senha && (
                                    <div className="mt-1 flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Força da senha:</span>
                                        <span className={`px-2 py-0.5 rounded font-bold ${infoForca.cor}`}>
                                            {infoForca.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Campo Confirmar Senha */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idConfirmacao" className="text-slate-200 cursor-text">
                                    Confirmar Senha
                                </Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        id="idConfirmacao"
                                        type={mostrarConfirmacao ? "text" : "password"}
                                        value={confirmacaoSenha}
                                        onChange={(e) => setConfirmacaoSenha(e.target.value)}
                                        onBlur={handleBlurConfirmacao}
                                        placeholder="Repita a senha"
                                        className={`w-full pl-8 pr-12 peer bg-slate-700 text-slate-100 font-semibold ${
                                            erroConfirmacao ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none" />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                                        className="absolute right-3 text-slate-200 hover:text-slate-400"
                                    >
                                        {mostrarConfirmacao ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {erroConfirmacao && (
                                    <span className="text-xs text-rose-400 font-medium mt-1">{erroConfirmacao}</span>
                                )}
                            </div>

                        </div>

                        <div className="mt-6">
                            <Button
                                type="submit"
                                disabled={carregando}
                                className="w-full bg-slate-900 hover:bg-slate-700 text-slate-100 font-bold h-11 border border-slate-600 transition-colors duration-150"
                            >
                                {carregando ? "Cadastrando..." : "Cadastrar Usuário"}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center text-sm text-slate-300 border-t border-slate-700 pt-4">
                        Já possui uma conta?{" "}
                        <Link to="/login" className="font-bold text-slate-100 hover:underline">
                            Voltar para o Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Cadastro;
