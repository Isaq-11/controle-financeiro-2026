import { cn } from "@/lib/utils";
import { formatarDinheiro } from "@/lib/format";

// tone: income | expense (cor só quando o valor carrega significado)
export function Stat({ label, value, tone, note }) {
    return (
        <div className="stat">
            <span className="stat__label">{label}</span>
            <span className={cn("stat__value num", tone === "income" && "is-income", tone === "expense" && "is-expense")}>{value}</span>
            {note && <span className="stat__note">{note}</span>}
        </div>
    );
}

// Número de destaque da tela inicial: o saldo, com entradas e saídas logo abaixo.
export function BalanceHero({ saldo, receitas, despesas, label = "Saldo atual" }) {
    const negativo = Number(saldo) < 0;
    return (
        <div className="balance">
            <span className="balance__label">{label}</span>
            <span className={cn("balance__value num", negativo && "is-expense")}>{formatarDinheiro(saldo)}</span>
            <div className="flow">
                <div className="flow__item">
                    <span className="flow__label">Receitas</span>
                    <span className="flow__value num is-income">{formatarDinheiro(receitas)}</span>
                </div>
                <div className="flow__item">
                    <span className="flow__label">Despesas</span>
                    <span className="flow__value num is-expense">{formatarDinheiro(despesas)}</span>
                </div>
            </div>
        </div>
    );
}
