import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/services/AuthContext";

export const RotaProtegida = () => {
    const { estaAutenticado, carregandoInicial } = useAuth();

    if (carregandoInicial) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Carregando sessão...</p>
                </div>
            </div>
        );
    }

    if (!estaAutenticado) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const RotaPublica = () => {
    const { estaAutenticado, carregandoInicial } = useAuth();

    if (carregandoInicial) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Verificando sessão...</p>
                </div>
            </div>
        );
    }

    if (estaAutenticado) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
