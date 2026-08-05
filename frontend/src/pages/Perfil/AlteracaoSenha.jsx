import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import { useState } from "react";
import { validarSenha, confirmarSenha, calcularForcaSenha } from "@/utils/validarForm";
import { useAuth } from "@/services/AuthContext";

const AlteracaoSenha = () => {
    const { alterarSenhaAtual } = useAuth();

    // 1. ESTADOS DO FORMULARIO
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");

    // 2. ESTADOS DE VALIDACAO E FEEDBACK VISUAL
    const [erroAtual, setErroAtual] = useState("");
    const [erroNova, setErroNova] = useState("");
    const [erroConfirmacao, setErroConfirmacao] = useState("");
    const [mensagemErroGeral, setMensagemErroGeral] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    const [mostrarAtual, setMostrarAtual] = useState(false);
    const [mostrarNova, setMostrarNova] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const infoForca = calcularForcaSenha(novaSenha);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErroAtual("");
        setErroNova("");
        setErroConfirmacao("");
        setMensagemErroGeral("");
        setMensagemSucesso("");

        let temErro = false;
        if (!senhaAtual) {
            setErroAtual("Campo obrigatório");
            temErro = true;
        }

        const msgNova = validarSenha(novaSenha);
        if (msgNova) {
            setErroNova(msgNova);
            temErro = true;
        }

        const msgConfirm = confirmarSenha(novaSenha, confirmacao);
        if (msgConfirm) {
            setErroConfirmacao(msgConfirm);
            temErro = true;
        }

        if (temErro) return;

        setCarregando(true);

        try {
            await alterarSenhaAtual(senhaAtual, novaSenha);
            setMensagemSucesso("Senha alterada com sucesso!");
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmacao("");
        } catch (error) {
            setMensagemErroGeral(error.message || "Erro ao alterar senha. Verifique a senha atual.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-50">Alteração de Senha</h1>
                <p className="text-sm text-slate-300">Área autenticada: Mude sua senha de acesso</p>
            </div>

            <Card className="bg-slate-800 border-slate-700 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-100">Atualizar Dados</CardTitle>
                    <CardDescription className="text-slate-300">
                        Informe a senha atual para confirmar a propriedade da conta
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Alertas de IHC (Vermelho para erro, Verde para sucesso) */}
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Senha Atual */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="idAtual" className="text-slate-200 cursor-text">
                                Senha Atual
                            </Label>
                            <div className="relative flex items-center w-full">
                                <Input
                                    id="idAtual"
                                    type={mostrarAtual ? "text" : "password"}
                                    value={senhaAtual}
                                    onChange={(e) => setSenhaAtual(e.target.value)}
                                    placeholder="Digite a senha atual"
                                    className={`w-full pl-8 pr-12 bg-slate-700 text-slate-100 font-semibold ${
                                        erroAtual ? "border-rose-500" : "border-slate-600"
                                    }`}
                                />
                                <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={() => setMostrarAtual(!mostrarAtual)}
                                    className="absolute right-3 text-slate-200 hover:text-slate-400"
                                >
                                    {mostrarAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {erroAtual && <span className="text-xs text-rose-400 font-medium mt-1">{erroAtual}</span>}
                        </div>

                        {/* Nova Senha */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="idNova" className="text-slate-200 cursor-text">
                                Nova Senha
                            </Label>
                            <div className="relative flex items-center w-full">
                                <Input
                                    id="idNova"
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
                                    <span className="text-slate-400">Força da nova senha:</span>
                                    <span className={`px-2 py-0.5 rounded font-bold ${infoForca.cor}`}>
                                        {infoForca.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirmação */}
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
                            {erroConfirmacao && <span className="text-xs text-rose-400 font-medium mt-1">{erroConfirmacao}</span>}
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={carregando}
                                className="w-full bg-slate-900 hover:bg-slate-700 text-slate-100 font-bold h-11 border border-slate-600 transition-colors duration-150"
                            >
                                {carregando ? "Alterando..." : "Alterar Senha"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlteracaoSenha;
