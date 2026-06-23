import { Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent, } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Mail, LockKeyhole } from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { validarEmail, validarSenha, confirmarSenha } from "@/utils/validarForm";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";


const Login = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

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
                                <Label htmlFor="idEmail" className= "text-slate-200 cursor-text">E-mail</Label>
                                <div className="relative flex items-center w-full">
                                    <Input id="idEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder = "Digite seu e-mail" className = "peer pl-8 bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 transition-colors duration-150"></Input>
                                    <Mail className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-950"/>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                
                                <Label htmlFor="idSenha" className = "text-slate-200 cursor-text">Senha</Label>
                                <div className="relative flex items-center w-full">
                                    <Input id="idSenha" type={mostrarSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder = "Digite sua senha" className = "w-full pl-8 pr-12 peer bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 transition-colors duration-150"></Input>
                                    <LockKeyhole className="absolute left-3 w-4 text-slate-200 pointer-events-none peer-focus-within:text-slate-950"/>
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
                            
                            <Button type="submit" disabled={carregando} className = "w-full bg-slate-950 hover:bg-slate-400 hover:text-slate-950 h-10 transition-colors duration-150">
                                {carregando ? "Carregando..." : "Entrar"}
                                {< ArrowRight className="w-4"/>}
                            </Button>
                            
                            <div className="flex flex-row text-slate-200 gap-1 cursor-text">
                                <p>
                                    Não tem uma conta?
                                </p>
                                <a onClick={() => navigate("/cadastro")} className="font-semibold hover:text-slate-400 cursor-pointer">
                                    Cadastre-se aqui
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

export default Login;


// import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Eye, EyeOff } from "lucide-react";
// import { useState } from "react";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [senha, setSenha] = useState("");
//   const [carregando, setCarregando] = useState(false);
//   const [mostrarSenha, setMostrarSenha] = useState(false);
  
//   // Estados para validações visuais
//   const [erroEmail, setErroEmail] = useState("");
//   const [erroSenha, setErroSenha] = useState("");
//   const [erroGeral, setErroGeral] = useState("");

//   const validarFormulario = () => {
//     let valido = true;
//     setErroEmail("");
//     setErroSenha("");
//     setErroGeral("");

//     // Validação do E-mail
//     if (!email) {
//       setErroEmail("Campo obrigatório");
//       valido = false;
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       setErroEmail("E-mail inválido");
//       valido = false;
//     }

//     // Validação da Senha
//     if (!senha) {
//       setErroSenha("Campo obrigatório");
//       valido = false;
//     } else if (senha.length < 6) {
//       setErroSenha("Mínimo 6 caracteres");
//       valido = false;
//     }

//     return valido;
//   };

//   const tentarLogar = async (e) => {
//     e.preventDefault();

//     if (!validarFormulario()) return;

//     setCarregando(true);

//     try {
//       console.log(`E-mail: ${email}, Senha: ${senha}`);
      
//       // Simulação do backend
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       // Mock de autenticação simples para teste
//       if (email === "teste@email.com" && senha === "123456") {
//         localStorage.setItem("token", "seu-token-mock-aqui");
//         // Aqui você faria o redirecionamento para o dashboard
//       } else {
//         throw new Error("Credenciais inválidas");
//       }

//     } catch (err) {
//       setErroGeral("Erro ao tentar logar. Verifique seus dados!");
//     } finally {
//       setCarregando(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 p-4">
//       <Card className="max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
//         <CardHeader className="space-y-3 text-center">
//           <CardTitle className="text-3xl font-bold text-slate-50">
//             Bem-Vindo de Volta!!
//           </CardTitle>
//           <CardDescription className="text-slate-400 text-base">
//             Faça Login para acessar sua Carteira
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="flex flex-col space-y-6">
//           <form onSubmit={tentarLogar} noValidate>
//             <div className="flex flex-col gap-5">
              
//               {/* Feedback Geral */}
//               {erroGeral && (
//                 <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center font-medium">
//                   {erroGeral}
//                 </div>
//               )}

//               {/* Campo de E-mail */}
//               <div className="flex flex-col gap-1">
//                 <Label htmlFor="idEmail" className="text-slate-200">E-mail</Label>
//                 <Input 
//                   id="idEmail" 
//                   type="email" 
//                   value={email} 
//                   onChange={(e) => setEmail(e.target.value)} 
//                   placeholder="Digite seu e-mail" 
//                   className={`bg-slate-700 text-slate-200 font-semibold focus-within:bg-slate-900 focus-within:text-slate-50 ${erroEmail ? "border-destructive focus-within:border-destructive" : "hover:border-slate-400"}`}
//                 />
//                 {erroEmail && <span className="text-xs text-red-400 font-medium">{erroEmail}</span>}
//               </div>

//               {/* Campo de Senha */}
//               <div className="flex flex-col gap-1">
//                 <Label htmlFor="idSenha" className="text-slate-200">Senha</Label>
//                 <div className="relative flex items-center w-full">
//                   <Input 
//                     id="idSenha" 
//                     type={mostrarSenha ? "text" : "password"} 
//                     value={senha} 
//                     onChange={(e) => setSenha(e.target.value)} 
//                     placeholder="Digite sua senha" 
//                     className={`w-full pr-12 bg-slate-700 text-slate-200 font-semibold focus-within:bg-slate-900 focus-within:text-slate-50 ${erroSenha ? "border-destructive focus-within:border-destructive" : "hover:border-slate-400"}`}
//                   />
//                   <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 text-slate-400 hover:text-slate-200">
//                     {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                   </button>
//                 </div>
//                 {erroSenha && <span className="text-xs text-red-400 font-medium">{erroSenha}</span>}

//                 <div className="flex justify-end mt-1">
//                   <a href="/recuperar-senha" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
//                     Esqueci minha senha
//                   </a>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col gap-3 mt-6">
//               <Button type="submit" disabled={carregando} className="w-full bg-slate-950 text-white hover:bg-slate-900 h-10 transition-colors">
//                 {carregando ? "Carregando..." : "Entrar"}
//               </Button>
              
//               <div className="flex flex-row text-slate-400 text-sm gap-1 justify-center mt-2">
//                 <p>Não tem uma conta?</p>
//                 <a href="/cadastro" className="font-semibold text-slate-200 hover:text-slate-50 transition-colors">
//                   Cadastre-se aqui
//                 </a>
//               </div>
//             </div>
//           </form>
//         </CardContent>

//         <CardFooter className="text-xs text-slate-500 text-center justify-center border-t border-slate-700/50 pt-4">
//           Dúvidas? Contate nosso suporte
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

// export default Login;


// ================================================
// ERROS
// import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Eye, EyeOff } from "lucide-react";
// import { useState } from "react";

// // Supondo que suas validações estão em um arquivo separado, importe-as assim:
// // import { validarEmail, validarSenha } from "@/services/validador";

// function Login () {
//     const [email, setEmail] = useState("");
//     const [senha, setSenha] = useState("");
//     const [carregando, setCarregando] = useState(false);
//     const [mostrarSenha, setMostrarSenha] = useState(false);

//     // 💡 PASSO 1: Criar os estados para armazenar as mensagens de erro
//     const [erroEmail, setErroEmail] = useState("");
//     const [erroSenha, setErroSenha] = useState("");
//     const [erroGeral, setErroGeral] = useState("");

//     const tentarLogar = async (e) => {
//         e.preventDefault();

//         // Limpa erros anteriores antes de validar novamente
//         setErroEmail("");
//         setErroSenha("");
//         setErroGeral("");

//         // 💡 PASSO 2: Executar suas funções utilitárias
//         const msgErroEmail = validarEmail(email);
//         const msgErroSenha = validarSenha(senha); // Corrigido aqui!

//         // Se houver qualquer erro, atualiza o estado e barra o login
//         if (msgErroEmail || msgErroSenha) {
//             setErroEmail(msgErroEmail);
//             setErroSenha(msgErroSenha);
//             return; 
//         }

//         setCarregando(true);

//         try {
//             console.log(`E-mail: ${email}, Senha: ${senha}`);

//             await new Promise((LOGARBACKEND) => setTimeout(LOGARBACKEND, 2000));

//             // Simulação de credenciais mockadas (boa prática pedida pelo enunciado)
//             if (email === "teste@email.com" && senha === "123456") {
//                 localStorage.setItem("token", "meu-token-ficticio-jwt");
//                 // Aqui no futuro você joga o usuário para o /dashboard
//             } else {
//                 // Cai direto no catch abaixo
//                 throw new Error("Credenciais inválidas");
//             }

//         } catch {
//             // 💡 PASSO 3: Feedback visual de erro de autenticação (sem alert!)
//             setErroGeral("E-mail ou senha incorretos. Verifique seus dados!");
//         } finally {
//             setCarregando(false);
//         }
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800">
//             <Card className="max-w-md w-full bg-slate-800 border border-slate-700 shadow-2xl p-6 mx-auto">
//                 <CardHeader className="space-y-3 text-center">
//                     <CardTitle className="text-3xl font-bold text-center text-slate-50">
//                         Bem-Vindo de Volta!! 
//                     </CardTitle>
//                     <CardDescription className="text-slate-400 text-base">
//                         Faça Login para acessar sua Carteira
//                     </CardDescription>
//                 </CardHeader>

//                 <CardContent className="flex flex-col space-y-6">
//                     <form onSubmit={tentarLogar} noValidate>
//                         <div className="flex flex-col gap-5">
                        
//                             {/* 💡 ALERTA GERAL: Erro de credenciais inválidas */}
//                             {erroGeral && (
//                                 <div className="bg-red-500/15 text-red-400 text-sm p-3 rounded-md border border-red-500/20 text-center font-medium">
//                                     {erroGeral}
//                                 </div>
//                             )}

//                             {/* Campo de E-mail */}
//                             <div className="flex flex-col gap-1">
//                                 <Label htmlFor="idEmail" className="text-slate-200">E-mail</Label>
//                                 <Input 
//                                     id="idEmail" 
//                                     type="email" 
//                                     value={email} 
//                                     onChange={(e) => setEmail(e.target.value)} 
//                                     placeholder="Digite seu e-mail" 
//                                     className={`bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 ${erroEmail ? "border-red-400 focus-within:border-red-400" : ""}`}
//                                 />
//                                 {/* 💡 TEXTO DE ERRO DO INPUT */}
//                                 {erroEmail && <span className="text-xs text-red-400 font-medium mt-0.5">{erroEmail}</span>}
//                             </div>

//                             {/* Campo de Senha */}
//                             <div className="flex flex-col gap-1">
//                                 <Label htmlFor="idSenha" className="text-slate-200">Senha</Label>
//                                 <div className="relative flex items-center w-full">
//                                     <Input 
//                                         id="idSenha" 
//                                         type={mostrarSenha ? "text" : "password"} 
//                                         value={senha} 
//                                         onChange={(e) => setSenha(e.target.value)} 
//                                         placeholder="Digite sua senha" 
//                                         className={`w-full pr-12 peer bg-slate-700 text-slate-200 font-semibold hover:border-slate-400 focus-within:bg-slate-400 focus-within:text-slate-950 ${erroSenha ? "border-red-400 focus-within:border-red-400" : ""}`}
//                                     />
//                                     <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 text-slate-200 hover:text-slate-500 peer-focus-within:text-slate-950">
//                                         {mostrarSenha ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
//                                     </button>
//                                 </div>
//                                 {/* 💡 TEXTO DE ERRO DO INPUT */}
//                                 {erroSenha && <span className="text-xs text-red-400 font-medium mt-0.5">{erroSenha}</span>}

//                                 <div className="flex justify-end mt-1">
//                                     <a href="#" className="text-sm font-semibold text-slate-200 hover:text-slate-400">
//                                         Esqueci minha senha
//                                     </a>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex flex-col gap-3 mt-6">
//                             <Button type="submit" disabled={carregando} className="w-full bg-slate-950 hover:bg-slate-400 hover:text-slate-950 h-10 transition-colors duration-200">
//                                 {carregando ? "Carregando..." : "Entrar"}
//                             </Button>
                            
//                             <div className="flex flex-row text-slate-200 gap-1 text-sm justify-center">
//                                 <p>Não tem uma conta?</p>
//                                 <a href="#" className="font-semibold hover:text-slate-400">
//                                     Cadastre-se aqui
//                                 </a>
//                             </div>
//                         </div>
//                     </form>
//                 </CardContent>

//                 <CardFooter className="text-xs text-slate-500 text-center justify-center border-t border-slate-700/50 pt-4 mt-2">
//                     Dúvidas? Contate nosso suporte
//                 </CardFooter>
//             </Card>
//         </div>
//     );
// }