import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import { RotaProtegida, RotaPublica } from "./components/RotaProtegida";
import AppLayout from "./components/AppLayout";

import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import InformarEmail from "./pages/RecuperacaoSenha/InformarEmail";
import ValidacaoCodigo from "./pages/RecuperacaoSenha/ValidacaoCodigo";
import RedefinicaoSenha from "./pages/RecuperacaoSenha/RedefinicaoSenha";
import Dashboard from "./pages/Dashboard/Dashboard";
import AlteracaoSenha from "./pages/Perfil/AlteracaoSenha";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rotas Públicas (Protegidas contra quem já está logado) */}
                    <Route element={<RotaPublica />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/cadastro" element={<Cadastro />} />
                        <Route path="/redefinicao-senha/informar-email" element={<InformarEmail />} />
                        <Route path="/redefinicao-senha/validacao-codigo" element={<ValidacaoCodigo />} />
                        <Route path="/redefinir-senha/:token" element={<RedefinicaoSenha />} />
                    </Route>

                    {/* Rotas Privadas / Autenticadas */}
                    <Route element={<RotaProtegida />}>
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/app/perfil/senha" element={<AlteracaoSenha />} />
                        </Route>
                    </Route>

                    {/* Redirecionamento Padrão */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
);
