import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, LogOut, Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { inicial } from "@/lib/format";

const TEMAS = {
    system: { rotulo: "Tema: automático", icone: Monitor },
    light: { rotulo: "Tema: claro", icone: Sun },
    dark: { rotulo: "Tema: escuro", icone: Moon },
};

// Tudo que é da conta (senha, tema, instalar app, sair) em um único lugar.
// variant "sidebar" mostra nome e e-mail; "compact" mostra só o avatar (barra superior do celular).
export default function AccountMenu({ variant = "sidebar", onLogout }) {
    const { usuarioLogado } = useAuth();
    const { tema, alternar } = useTheme();
    const { podeInstalar, instalar } = usePwaInstall();
    const [aberto, setAberto] = useState(false);
    const raiz = useRef(null);

    useEffect(() => {
        if (!aberto) return;
        const fora = (e) => !raiz.current?.contains(e.target) && setAberto(false);
        const esc = (e) => e.key === "Escape" && setAberto(false);
        document.addEventListener("pointerdown", fora);
        document.addEventListener("keydown", esc);
        return () => {
            document.removeEventListener("pointerdown", fora);
            document.removeEventListener("keydown", esc);
        };
    }, [aberto]);

    const nome = usuarioLogado?.nome || usuarioLogado?.name || "Usuário";
    const IconeTema = TEMAS[tema].icone;

    return (
        <div className={variant === "sidebar" ? "menu menu--up" : "menu"} ref={raiz}>
            <button
                type="button"
                className="menu__trigger"
                aria-expanded={aberto}
                aria-haspopup="menu"
                aria-label={variant === "compact" ? "Abrir menu da conta" : undefined}
                onClick={() => setAberto((v) => !v)}
                style={variant === "compact" ? { width: "auto", padding: 0, minHeight: "2.75rem" } : undefined}
            >
                <span className="avatar">{inicial(nome)}</span>
                {variant === "sidebar" && (
                    <span style={{ minWidth: 0 }}>
                        <span className="truncate" style={{ display: "block", fontWeight: 600, fontSize: "0.9375rem" }}>
                            {nome}
                        </span>
                        <span className="truncate muted small" style={{ display: "block" }}>
                            {usuarioLogado?.email}
                        </span>
                    </span>
                )}
            </button>

            {aberto && (
                <div className="menu__panel" role="menu">
                    <Link to="/app/perfil/senha" className="menu__item" role="menuitem" onClick={() => setAberto(false)}>
                        <KeyRound className="icon" /> Alterar senha
                    </Link>
                    <button type="button" className="menu__item" role="menuitem" onClick={alternar}>
                        <IconeTema className="icon" /> {TEMAS[tema].rotulo}
                    </button>
                    {podeInstalar && (
                        <button
                            type="button"
                            className="menu__item"
                            role="menuitem"
                            onClick={() => {
                                instalar();
                                setAberto(false);
                            }}
                        >
                            <Smartphone className="icon" /> Instalar aplicativo
                        </button>
                    )}
                    <div className="menu__sep" />
                    <button type="button" className="menu__item menu__item--danger" role="menuitem" onClick={onLogout}>
                        <LogOut className="icon" /> Sair
                    </button>
                </div>
            )}
        </div>
    );
}
