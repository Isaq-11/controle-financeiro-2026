import { useRef } from "react";

// Código de verificação em caixas separadas: avança sozinho, volta com Backspace
// e aceita colar o código inteiro. `valor` é um array de dígitos.
export default function OtpInput({ valor, onChange, tamanho = 6 }) {
    const refs = useRef([]);

    const digitar = (indice, texto) => {
        const proximo = [...valor];
        const char = texto.slice(-1);
        proximo[indice] = char;
        onChange(proximo);
        if (char && indice < tamanho - 1) refs.current[indice + 1]?.focus();
    };

    const teclar = (indice, e) => {
        if (e.key === "Backspace" && !valor[indice] && indice > 0) refs.current[indice - 1]?.focus();
    };

    const colar = (e) => {
        e.preventDefault();
        const texto = e.clipboardData.getData("text").trim().slice(0, tamanho);
        if (!texto) return;
        const proximo = Array(tamanho).fill("");
        [...texto].forEach((c, i) => (proximo[i] = c));
        onChange(proximo);
        refs.current[Math.min(texto.length, tamanho - 1)]?.focus();
    };

    return (
        <div className="otp" onPaste={colar} role="group" aria-label="Código de verificação">
            {valor.map((digito, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    className="input"
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digito}
                    onChange={(e) => digitar(i, e.target.value)}
                    onKeyDown={(e) => teclar(i, e)}
                    aria-label={`Dígito ${i + 1} de ${tamanho}`}
                />
            ))}
        </div>
    );
}
