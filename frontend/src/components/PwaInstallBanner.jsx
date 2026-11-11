import { useState, useEffect } from "react";
import { Download, Smartphone, Check } from "lucide-react";

const PwaInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [podeInstalar, setPodeInstalar] = useState(false);
    const [instalado, setInstalado] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setPodeInstalar(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        window.addEventListener("appinstalled", () => {
            setInstalado(true);
            setPodeInstalar(false);
            setDeferredPrompt(null);
            setTimeout(() => setInstalado(false), 4000);
        });

        // Verifica se já está rodando em modo standalone (PWA instalado)
        if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
            setPodeInstalar(false);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const aoInstalar = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setPodeInstalar(false);
        }
        setDeferredPrompt(null);
    };

    if (instalado) {
        return (
            <div className="mx-4 mb-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Aplicativo instalado com sucesso!</span>
            </div>
        );
    }

    if (!podeInstalar) return null;

    return (
        <div className="mx-4 mb-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Usar como App (PWA)</span>
                </div>
                <button
                    onClick={aoInstalar}
                    className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                >
                    <Download className="w-3 h-3" />
                    <span>Instalar</span>
                </button>
            </div>
        </div>
    );
};

export default PwaInstallBanner;

