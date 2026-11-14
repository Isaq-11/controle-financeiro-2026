// Formatadores e helpers compartilhados entre as telas.
// Antes, formatarDinheiro/formatarData eram redefinidos dentro de cada página
// e não separavam milhar ("R$ 12345,67"). Agora há uma única fonte.

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export const formatarDinheiro = (valor) => moeda.format(Number(valor || 0));

export const formatarCompacto = (valor) => compacto.format(Number(valor || 0));

// Aceita "2026-11-12", "2026-11-12T10:00:00" ou Date. Evita o desvio de fuso
// que acontece ao fazer new Date("2026-11-12").
export const formatarData = (valor) => {
    if (!valor) return "-";
    const texto = String(valor).split("T")[0];
    const partes = texto.split("-");
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? "-" : data.toLocaleDateString("pt-BR");
};

export const dataLocalISO = (data = new Date()) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

export const nomeDoUsuario = (usuario) =>
    usuario?.name || usuario?.nome || usuario?.email || "Membro";

export const inicial = (nome) => (nome || "?").trim().charAt(0).toUpperCase();

export const mensagemDeErro = (err, padrao) =>
    err?.response?.data?.mensagem || err?.response?.data?.message || err?.message || padrao;

// Converte o que a pessoa digita ("1.234,56", "12,5", "12.5") em número.
// A versão antiga só trocava a primeira vírgula e transformava "1.234,56" em 1.234.
export const converterValorBR = (texto) => {
    const limpo = String(texto ?? "").trim().replace(/[^\d.,-]/g, "");
    const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
    return parseFloat(normalizado);
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// "2026-11" -> "Nov/2026". Qualquer outro texto volta como veio.
export const rotuloMes = (anoMes) => {
    const m = /^(\d{4})-(\d{2})/.exec(String(anoMes || ""));
    return m ? `${MESES[Number(m[2]) - 1] || m[2]}/${m[1]}` : String(anoMes ?? "");
};
