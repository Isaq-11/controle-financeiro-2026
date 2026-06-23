import { Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent, } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Mail, LockKeyhole, User, Dock } from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { validarEmail, validarSenha, confirmarSenha } from "@/utils/validarForm";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";


const Cadastro = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

    const navigate = useNavigate();

    const tentarLogar = async (e) => {
        e.preventDefault();

        const msgErroEmail = validarEmail(email);
        const msgErroSenha = validarSenha(senha);
        if(!email || !senha){
            alert("Preencha todos os campos!!");
            return;
        }

        setCarregando(true);

        try{
            console.log(`E-mail: ${email}, Senha: ${senha}`);

            await new Promise((LOGARBACKEND) => setTimeout(LOGARBACKEND, 2000));

            alert("Login bem-sucedido!!");

        } catch{
            alert("Erro ao tentar logar. Verifique seus dados!!");
        } finally{
            setCarregando(false);
        }
    }

    return (
        <div className = "min-h-screen flex items-center justify-center w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800">

            <Card className = "max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">

                <CardHeader className="space-y-3 text-center">
                    <CardTitle className = "text-3xl font-bold text-center text-slate-50">
                        Junte-se a Nós!! 
                    </CardTitle>

                    <CardDescription className="text-slate-50 text-base">
                        Preencha os campos abaixo e crie sua conta
                    </CardDescription>
                </CardHeader>

                <CardContent className = "flex flex-col space-y-6">
                    <form onSubmit={tentarLogar}>
                        <div className="flex flex-col gap-5">
                        
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idEmail" className= "text-slate-200 cursor-text">Nome Completo</Label>
                                <div className="relative flex items-center w-full">
                                    <Input id="idEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder = "Digite seu e-mail" className = "peer pl-8 bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 transition-colors duration-150"></Input>
                                    <User className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-950"/>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idEmail" className= "text-slate-200 cursor-text">E-mail</Label>
                                <div className="relative flex items-center w-full">
                                    <Input id="idEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder = "Digite seu e-mail" className = "peer pl-8 bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 transition-colors duration-150"></Input>
                                    <Mail className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-950"/>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idEmail" className= "text-slate-200 cursor-text">CPF</Label>
                                <div className="relative flex items-center w-full">
                                    <Input id="idEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder = "Digite seu e-mail" className = "peer pl-8 bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 transition-colors duration-150"></Input>
                                    <Dock className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-950"/>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                
                                <Label htmlFor="idSenha" className = "text-slate-200">Senha</Label>
                                
                                <div className="relative flex items-center w-full">
                                    <Input id="idSenha" type={mostrarSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder = "Digite sua senha" className = "w-full pl-8 pr-12 peer bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 transition-colors duration-150"></Input>
                                    <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-950"/>
                                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 text-slate-200 hover:text-slate-500 
                                    peer-focus-within:text-slate-950">
                                        {mostrarSenha ? (<EyeOff />) : (<Eye />)}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                
                                <Label htmlFor="idConfirmacaoSenha" className = "text-slate-200">Confirme sua Senha</Label>
                                <div className="relative flex items-center w-full">
                                    <Input id="idConfirmacaoSenha" type={mostrarConfirmacaoSenha ? "text" : "password"} value={confirmacaoSenha} onChange={(e) => setConfirmacaoSenha(e.target.value)} placeholder = "Confirme sua senha" className = "w-full pl-8 pr-12 peer bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 transition-colors duration-150"></Input>
                                    <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-950"/>
                                    <button type="button" onClick={() => setMostrarConfirmacaoSenha(!mostrarConfirmacaoSenha)} className="absolute right-3 text-slate-200 hover:text-slate-500 
                                    peer-focus-within:text-slate-950">
                                        {mostrarConfirmacaoSenha ? (<EyeOff />) : (<Eye />)}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            
                            <Button type="submit" disabled={carregando} className = "w-full bg-slate-950 hover:bg-slate-400 hover:text-slate-950 h-10 transition-colors duration-200">
                                {carregando ? "Carregando..." : "Criar Conta"}
                            </Button>
                            
                            <div className="flex flex-row text-slate-200 gap-1 peer-hover:text-slate-400">
                                <a onClick={() => navigate(-1)} className="flex items-center peer gap-1 font-semibold hover:text-slate-400">
                                    <ArrowLeft className="w-4"/>
                                    <span>Voltar</span>       
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>

                {/* <CardFooter>
                    <div className="flex flex-row text-sm text-slate-300 gap-1">
                                <p>
                                    Dúvidas?
                                </p>
                                <a href="#" className="font-semibold hover:text-slate-400">
                                    Contate nosso suporte
                                </a>
                            </div>                    
                </CardFooter> */}
            </Card>

        </div>
    );
}

export default Cadastro;
