import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { validarSenha, confirmarSenha, calcularForcaSenha } from "@/utils/validarForm";

const RedefinicaoSenha = () => {
    // 1. Pega o token da URL que foi enviado como parâmetro (ex: /redefinir-senha/123456)
    const { token } = useParams();
    const navigate = useNavigate();

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");

    const [erroNova, setErroNova] = useState("");
    const [erroConfirmacao, setErroConfirmacao] = useState("");
    const [mensagemErroGeral, setMensagemErroGeral] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    const [mostrarNova, setMostrarNova] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const infoForca = calcularForcaSenha(novaSenha);

    const handleRedefinir = async (e) => {
        e.preventDefault();

        setErroNova("");
        setErroConfirmacao("");
        setMensagemErroGeral("");
        setMensagemSucesso("");

        // Validação se token existe na URL
        if (!token || token.trim() === "") {
            setMensagemErroGeral("Token ausente ou inválido na URL!");
            return;
        }

        const msgNova = validarSenha(novaSenha);
        const msgConfirm = confirmarSenha(novaSenha, confirmacao);

        if (msgNova || msgConfirm) {
            setErroNova(msgNova);
            setErroConfirmacao(msgConfirm);
            return;
        }

        setCarregando(true);

        try {
            // Simula redefinição de senha
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setMensagemSucesso("Senha redefinida com sucesso! Redirecionando para login...");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch {
            setMensagemErroGeral("Erro ao redefinir a senha.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-slate-950 p-4">
            <Card className="max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
                <CardHeader className="space-y-3 text-center">
                    <CardTitle className="text-3xl font-bold text-center text-slate-50">
                        Redefinir Senha
                    </CardTitle>
                    <CardDescription className="text-slate-200 text-base">
                        Token recebido: <span className="font-mono text-slate-100 font-bold">{token || "Sem Token"}</span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col space-y-6">
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

                    <form onSubmit={handleRedefinir}>
                        <div className="flex flex-col gap-4">
                            
                            {/* Nova Senha */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idNovaSenha" className="text-slate-200 cursor-text">
                                    Nova Senha
                                </Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        id="idNovaSenha"
                                        type={mostrarNova ? "text" : "password"}
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        placeholder="Digite a nova senha"
                                        className={`w-full pl-8 pr-12 bg-slate-700 text-slate-100 font-semibold ${
                                            erroNova ? "border-rose-500" : "border-slate-600"
                                        }`}
                                    />
                                    <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none" />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarNova(!mostrarNova)}
                                        className="absolute right-3 text-slate-200 hover:text-slate-400"
                                    >
                                        {mostrarNova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {erroNova && <span className="text-xs text-rose-400 font-medium mt-1">{erroNova}</span>}

                                {novaSenha && (
                                    <div className="mt-1 flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Força da senha:</span>
                                        <span className={`px-2 py-0.5 rounded font-bold ${infoForca.cor}`}>
                                            {infoForca.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirmação de Senha */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idConfirm" className="text-slate-200 cursor-text">
                                    Confirmar Nova Senha
                                </Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        id="idConfirm"
                                        type={mostrarConfirmacao ? "text" : "password"}
                                        value={confirmacao}
                                        onChange={(e) => setConfirmacao(e.target.value)}
                                        placeholder="Repita a nova senha"
                                        className={`w-full pl-8 pr-12 bg-slate-700 text-slate-100 font-semibold ${
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
                                {carregando ? "Salvando..." : "Salvar Nova Senha"}
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

export default RedefinicaoSenha;
