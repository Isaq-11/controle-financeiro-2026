import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { BarChart3, LayoutDashboard, Tag, Users, Wallet } from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { APP_NAME } from "@/lib/brand";
import AccountMenu from "./AccountMenu";

// Mesmas quatro áreas em dois formatos: barra lateral no computador e
// barra inferior no celular (alcançável com o polegar, padrão em PWA).
const NAVEGACAO = [
    { to: "/dashboard", rotulo: "Painel", icone: LayoutDashboard },
    { to: "/carteiras", rotulo: "Carteiras", icone: Users },
    { to: "/categorias", rotulo: "Categorias", icone: Tag },
    { to: "/relatorios", rotulo: "Relatórios", icone: BarChart3 },
];

const Marca = () => (
    <Link to="/dashboard" className="brand">
        <span className="brand__mark">
            <Wallet className="icon icon--sm" aria-hidden="true" />
        </span>
        {APP_NAME}
    </Link>
);

export default function AppLayout() {
    const { realizarLogout } = useAuth();
    const navigate = useNavigate();

    const sair = () => {
        realizarLogout();
        navigate("/login");
    };

    return (
        <div className="shell">
            <aside className="sidebar">
                <div>
                    <Marca />
                    <nav className="nav" aria-label="Principal">
                        {NAVEGACAO.map(({ to, rotulo, icone: Icone }) => (
                            <NavLink key={to} to={to} className="nav__link">
                                <Icone className="icon" aria-hidden="true" />
                                {rotulo}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <AccountMenu variant="sidebar" onLogout={sair} />
            </aside>

            <header className="topbar">
                <Marca />
                <AccountMenu variant="compact" onLogout={sair} />
            </header>

            <main className="shell__main">
                <div className="page">
                    <Outlet />
                </div>
            </main>

            <nav className="tabbar" aria-label="Principal">
                {NAVEGACAO.map(({ to, rotulo, icone: Icone }) => (
                    <NavLink key={to} to={to} className="tabbar__link">
                        <Icone className="icon" aria-hidden="true" />
                        {rotulo}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
