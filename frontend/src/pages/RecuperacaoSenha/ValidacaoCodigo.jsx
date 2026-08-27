import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

const ValidacaoCodigo = () => {
    const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const inputRefs = useRef([]);

    const navigate = useNavigate();

    const handleDigitoChange = (index, valor) => {
        const novoCodigo = [...codigo];
        const char = valor.slice(-1);
        novoCodigo[index] = char;
        setCodigo(novoCodigo);

        // Avança o foco automaticamente para o próximo input
        if (char && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Volta o foco ao apertar Backspace
        if (e.key === "Backspace" && !codigo[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text").trim().slice(0, 6);
        if (!pastedText) return;

        const novoCodigo = ["", "", "", "", "", ""];
        for (let i = 0; i < pastedText.length; i++) {
            novoCodigo[i] = pastedText[i];
        }
        setCodigo(novoCodigo);

        const focusIndex = Math.min(pastedText.length, 5);
        if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
        }
    };

    const verificarCodigo = async (e) => {
        e.preventDefault();
        setErro("");

        const codigoString = codigo.join("").trim();
        if (codigoString.length < 6) {
            setErro("Preencha todos os 6 dígitos do código recebido por e-mail!");
            return;
        }

        setCarregando(true);

        try {
            // Avança para a tela de redefinição passando o código inserido como parâmetro de token
            navigate(`/redefinir-senha/${codigoString}`);
        } catch {
            setErro("Código inválido ou não informado!");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-slate-950 p-4">
            <Card className="max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
                <CardHeader className="space-y-3 text-center">
                    <CardTitle className="text-3xl font-bold text-center text-slate-50">
                        Código de Verificação
                    </CardTitle>
                    <CardDescription className="text-slate-200 text-base">
                        Etapa 2: Digite abaixo o código de 6 dígitos enviado para seu e-mail
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col space-y-6">
                    {erro && (
                        <div className="p-3 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-sm font-medium text-center">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={verificarCodigo}>
                        <div className="flex flex-col gap-4 items-center">
                            <Label className="text-slate-200 text-sm font-medium self-start">
                                Digite os 6 números / dígitos:
                            </Label>
                            
                            <div className="flex justify-between w-full gap-2" onPaste={handlePaste}>
                                {codigo.map((digito, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength={1}
                                        value={digito}
                                        onChange={(e) => handleDigitoChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        placeholder="-"
                                        className="w-12 h-14 text-center bg-slate-700 text-slate-100 text-xl font-bold border-slate-600 focus:border-emerald-500 uppercase"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="submit"
                                disabled={carregando}
                                className="w-full bg-slate-900 hover:bg-slate-700 text-slate-100 font-bold h-11 border border-slate-600 transition-colors duration-150"
                            >
                                {carregando ? "Validando Código..." : "Validar Código e Continuar"}
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

export default ValidacaoCodigo;
