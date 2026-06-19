import { Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent, } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";

function Login () {
    return (
        <div className = "min-h-screen flex items-center justify-center w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800">
            <Card className = "max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
                <CardHeader className="space-y-3 text-center">
                    <CardTitle className = "text-3xl font-bold text-center text-slate-50">
                        Bem-Vindo, 'aq será nome'!! 
                    </CardTitle>
                    <CardDescription className="text-slate-50 text-base">
                        Faça Login para acessar sua Carteira
                    </CardDescription>
                </CardHeader>

                <CardContent className = "flex flex-col space-y-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="idEmail" className = "text-slate-200">E-mail / Nome de usuário</Label>
                            <Input id="idEmail" type="email" placeholder = "digite email" className = "bg-slate-700 text-slate-200 hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950"></Input>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="idSenha" className = "text-slate-200">Senha</Label>
                            <Input id="idSenha" type="password" placeholder = "digite senha" className = "bg-slate-700 text-slate-200 hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950"></Input>
                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-slate-200 hover:text-slate-400">
                                    Esqueci minha senha
                                    </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button className = "w-full bg-slate-950 hover:bg-slate-400 hover:text-slate-950 h-10">
                            Entrar
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
                </CardContent>

                <CardFooter>
                    Dúvidas? Contate nosso suporte
                </CardFooter>
            </Card>

        </div>
    );
}

export default Login;