export const validarEmail = (email) => {
    if (!email) return "Campo obrigatório";

    const emailRegex = /\S+@\S+\.\S+/;
    if(!emailRegex.test(email)) return "E-mail inválido";

    return "";
}

export const validarSenha = (senha) => {
    if(!senha) return "Campo obrigatório";

    if(senha.length < 6) return "Deve ter no mínimo 6 caracteres"

    return "";
}

export const confirmarSenha = (senhaInformada, senha) => {
    if(!senha) return "Campo obrigatório";
    
    if(senha != senhaInformada) return "As senhas não coincidem";

    return "";
}