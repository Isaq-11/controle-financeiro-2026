import { Car, DollarSign, HeartPulse, House, ShoppingBag, Smile, Tag, TrendingUp, Wallet } from "lucide-react";

// O ícone escolhido ao criar a categoria agora é de fato exibido
// (antes todas apareciam com o mesmo ícone de etiqueta, apesar do seletor).
export const ICONES_CATEGORIA = [
    { id: "tag", rotulo: "Etiqueta", componente: Tag },
    { id: "wallet", rotulo: "Carteira", componente: Wallet },
    { id: "shopping-bag", rotulo: "Compras", componente: ShoppingBag },
    { id: "car", rotulo: "Transporte", componente: Car },
    { id: "home", rotulo: "Moradia", componente: House },
    { id: "smile", rotulo: "Lazer", componente: Smile },
    { id: "heart-pulse", rotulo: "Saúde", componente: HeartPulse },
    { id: "trending-up", rotulo: "Investimento", componente: TrendingUp },
    { id: "dollar-sign", rotulo: "Salário", componente: DollarSign },
];

export default function CategoryIcon({ id, className = "icon" }) {
    const Icone = ICONES_CATEGORIA.find((i) => i.id === id)?.componente || Tag;
    return <Icone className={className} aria-hidden="true" />;
}
