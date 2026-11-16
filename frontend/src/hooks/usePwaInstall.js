import { useSyncExternalStore } from "react";

// O evento "beforeinstallprompt" dispara uma única vez e muitas vezes ANTES de a
// tela autenticada montar. Por isso ele é capturado aqui, no escopo do módulo
// (importado em main.jsx), e os componentes apenas assinam o estado.
let promptAdiado = null;
let instalado = false;
const ouvintes = new Set();
let snapshot = { podeInstalar: false, instalado: false };

const atualizar = () => {
    snapshot = { podeInstalar: !!promptAdiado && !instalado, instalado };
    ouvintes.forEach((fn) => fn());
};

if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        promptAdiado = e;
        atualizar();
    });
    window.addEventListener("appinstalled", () => {
        instalado = true;
        promptAdiado = null;
        atualizar();
    });
    if (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true) {
        instalado = true;
        atualizar();
    }
}

const assinar = (fn) => {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
};

export function usePwaInstall() {
    const estado = useSyncExternalStore(assinar, () => snapshot, () => snapshot);

    const instalar = async () => {
        if (!promptAdiado) return;
        promptAdiado.prompt();
        await promptAdiado.userChoice;
        promptAdiado = null;
        atualizar();
    };

    return { ...estado, instalar };
}
