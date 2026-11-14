import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/services/AuthContext";
import { LoadingState } from "@/components/ui/feedback";

// Rotas privadas exigem sessão; rotas públicas redirecionam quem já está logado.
const useCarregandoSessao = () => {
    const { carregando, carregandoInicial } = useAuth();
    return carregando || carregandoInicial;
};

export const RotaProtegida = () => {
    const { estaAutenticado } = useAuth();
    if (useCarregandoSessao()) return <LoadingState screen label="Carregando sessão..." />;
    return estaAutenticado ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RotaPublica = () => {
    const { estaAutenticado } = useAuth();
    if (useCarregandoSessao()) return <LoadingState screen label="Verificando sessão..." />;
    return estaAutenticado ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
