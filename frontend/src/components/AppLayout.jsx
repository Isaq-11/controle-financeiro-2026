import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/services/AuthContext";
import { LayoutDashboard, KeyRound, LogOut, Wallet, Menu, X } from "lucide-react";

// Layout base com menu lateral (Sidebar) e topo para o estudante entender
const AppLayout = () => {
    const { usuarioLogado, realizarLogout } = useAuth();
    const navigate = useNavigate();
    const [menuMobileAberto, setMenuMobileAberto] = useState(false);

    const aoClicarLogout = () => {
        realizarLogout();
        navigate("/login");
    };

    // Classe para destacar o link ativo do menu
    const obterClasseLink = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
            isActive
                ? "bg-slate-800 text-slate-100 border border-slate-700"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
        }`;

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-100">
            {/* Sidebar Lateral para computadores / telas grandes */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
                    menuMobileAberto ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-5">
                    {/* Nome do Sistema */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-slate-100" />
                            <span className="font-bold text-lg text-slate-100">Controle Financeiro</span>
                        </div>
                        <button className="lg:hidden text-slate-400" onClick={() => setMenuMobileAberto(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Links de Navegacao */}
                    <nav className="space-y-2">
                        <NavLink to="/dashboard" onClick={() => setMenuMobileAberto(false)} className={obterClasseLink}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink to="/app/perfil/senha" onClick={() => setMenuMobileAberto(false)} className={obterClasseLink}>
                            <KeyRound className="w-4 h-4" />
                            <span>Alterar Senha</span>
                        </NavLink>
                    </nav>
                </div>

                {/* Dados do Usuario Logado no Rodape da Sidebar */}
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-100 truncate">{usuarioLogado?.nome || "Usuário"}</p>
                            <p className="text-xs text-slate-400 truncate">{usuarioLogado?.email}</p>
                        </div>

                        <button
                            onClick={aoClicarLogout}
                            title="Sair"
                            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Conteudo Principal */}
            <div className="flex-1 flex flex-col lg:pl-64">
                {/* Navbar Superior para Celular */}
                <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between lg:hidden">
                    <button onClick={() => setMenuMobileAberto(true)} className="p-2 text-slate-300">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-slate-100 text-sm">Controle Financeiro</span>
                    <div></div>
                </header>

                <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
