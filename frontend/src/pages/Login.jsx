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

function Login () {
    return (
        <div className = "min-h-screen flex items-center justify-center w-full bg-slate-900">
            <Card className = "max-w-md bg-slate-600 w-full ">
                <CardHeader>
                    <CardTitle>
                        Login
                    </CardTitle>
                    <CardDescription className="text-slate-100">
                        Faça Login para acessar sua Carteira
                    </CardDescription>
                </CardHeader>

                <CardContent className = "flex flex-col space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="idEmail">E-mail / Nome de usuário</Label>
                            <Input id="idEmail" type="email" placeholder = "digite email"></Input>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="idSenha">Senha</Label>
                            <Input id="idSenha" type="passwor" placeholder = "digite senha"></Input>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button className = "w-full">
                            Entrar
                        </Button>
                        <Button variant="secondary" className = "w-full">
                            Não tem uma conta? Cadastre-se
                        </Button>

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