import { Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent, } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import { useState } from "react";

function Login () {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const tentarLogar = async (e) => {
        e.preventDefault();

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
                        Bem-Vindo de Volta!! 
                    </CardTitle>

                    <CardDescription className="text-slate-50 text-base">
                        Faça Login para acessar sua Carteira
                    </CardDescription>
                </CardHeader>

                <CardContent className = "flex flex-col space-y-6">
                    <form onSubmit={tentarLogar}>
                        <div className="flex flex-col gap-5">
                        
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="idEmail" className = "text-slate-200">E-mail</Label>
                                <Input id="idEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder = "Digite seu e-mail" className = "bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950"></Input>
                            </div>

                            <div className="flex flex-col gap-1">
                                
                                <Label htmlFor="idSenha" className = "text-slate-200">Senha</Label>
                                
                                <div className="relative flex items-center w-full">
                                    <Input id="idSenha" type={mostrarSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder = "Digite sua senha" className = "w-full pr-12 peer bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950"></Input>

                                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 text-slate-200 hover:text-slate-500 
                                    peer-focus-within:text-slate-950">
                                        {mostrarSenha ? (<EyeOff />) : (<Eye />)}
                                    </button>
                                </div>

                                <div className="flex justify-end">
                                    <a href="#" className="text-sm font-semibold text-slate-200 hover:text-slate-400">
                                        Esqueci minha senha
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            
                            <Button type="submit" disabled={carregando} className = "w-full bg-slate-950 hover:bg-slate-400 hover:text-slate-950 h-10 transition-colors duration-200">
                                {carregando ? "Carregando..." : "Entrar"}
                            </Button>
                            
                            <div className="flex flex-row text-slate-200 gap-1">
                                <p>
                                    Não tem uma conta?
                                </p>
                                <a href="#" className="font-semibold hover:text-slate-400">
                                        Cadastre-se aqui
                                    </a>
                            </div>
                        </div>
                    </form>
                </CardContent>

                <CardFooter>
                    Dúvidas? Contate nosso suporte
                </CardFooter>
            </Card>

        </div>
    );
}

export default Login;