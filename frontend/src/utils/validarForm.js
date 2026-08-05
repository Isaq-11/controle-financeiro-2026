// utilitarios de validacao de formulario simples e direta

// Valida se o email nao esta vazio e se possui formato basico com @ e ponto
export const validarEmail = (email) => {
    if (!email) {
        return "Campo obrigatório";
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return "E-mail inválido";
    }
    return "";
};

// Valida a senha (obrigatoria e minimo 6 caracteres)
export const validarSenha = (senha) => {
    if (!senha) {
        return "Campo obrigatório";
    }
    if (senha.length < 6) {
        return "Mínimo 6 caracteres";
    }
    return "";
};

// Valida se a confirmacao de senha e igual a senha original
export const confirmarSenha = (senhaOriginal, confirmacao) => {
    if (!confirmacao) {
        return "Campo obrigatório";
    }
    if (senhaOriginal !== confirmacao) {
        return "As senhas não coincidem";
    }
    return "";
};

// Valida se o nome nao esta em branco
export const validarNome = (nome) => {
    if (!nome) {
        return "Campo obrigatório";
    }
    return "";
};

// Avalia a forca da senha em: Fraca, Media ou Forte
export const calcularForcaSenha = (senha) => {
    if (!senha) return { label: "", cor: "" };
    
    // Regra simples: tamanho da senha
    if (senha.length < 6) {
        return { label: "Muito curta", cor: "bg-rose-600 text-rose-300" };
    }
    
    // Se tiver letras e numeros e mais de 8 caracteres e forte
    const temNumero = /\d/.test(senha);
    const temLetra = /[a-zA-Z]/.test(senha);

    if (senha.length >= 8 && temNumero && temLetra) {
        return { label: "Senha Forte", cor: "bg-emerald-600 text-emerald-200" };
    } else if (senha.length >= 6 && (temNumero || temLetra)) {
        return { label: "Senha Média", cor: "bg-amber-600 text-amber-200" };
    } else {
        return { label: "Senha Fraca", cor: "bg-rose-600 text-rose-300" };
    }
};