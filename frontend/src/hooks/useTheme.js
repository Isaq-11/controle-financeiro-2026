import { useCallback, useEffect, useState } from "react";

const CHAVE = "tema";
const CORES = { light: "#f3f5f2", dark: "#0e1411" };

const lerTema = () => {
    try {
        const salvo = localStorage.getItem(CHAVE);
        return salvo === "light" || salvo === "dark" ? salvo : "system";
    } catch {
        return "system";
    }
};

const aplicar = (tema) => {
    const raiz = document.documentElement;
    if (tema === "system") raiz.removeAttribute("data-theme");
    else raiz.setAttribute("data-theme", tema);

    const efetivo =
        tema === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            : tema;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", CORES[efetivo]));
};

// Alterna entre automático (segue o sistema), claro e escuro.
export function useTheme() {
    const [tema, setTema] = useState(lerTema);

    useEffect(() => {
        aplicar(tema);
    }, [tema]);

    const alternar = useCallback(() => {
        setTema((atual) => {
            const proximo = atual === "system" ? "light" : atual === "light" ? "dark" : "system";
            try {
                if (proximo === "system") localStorage.removeItem(CHAVE);
                else localStorage.setItem(CHAVE, proximo);
            } catch { /* armazenamento indisponível: segue só em memória */ }
            return proximo;
        });
    }, []);

    return { tema, alternar };
}
