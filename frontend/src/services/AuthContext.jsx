import { createContext, useContext, useState, useEffect } from "react";

// Contexto de autenticacao simples para o estudante entender
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Estado do usuario logado (null se nao estiver logado)
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [carregando, setCarregando] = useState(true);

    // Quando a pagina carrega, verifica se ja existe um token salvo no localStorage
    useEffect(() => {
        const tokenSalvo = localStorage.getItem("token_usuario");
        const usuarioSalvo = localStorage.getItem("dados_usuario");

        if (tokenSalvo && usuarioSalvo) {
            // Se encontrou, converte o texto em objeto javascript
            setUsuarioLogado(JSON.parse(usuarioSalvo));
        }
        setCarregando(false);
    }, []);

    // Funcao de login simples que simula a chamada para o backend
    const realizarLogin = async (email, senha) => {
        // Simula um tempo de espera de 1.5 segundos (como se estivesse indo no servidor)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Busca lista de usuarios salvos no localStorage (ou usa um padrao)
        const usuariosCadastrados = JSON.parse(localStorage.getItem("usuarios_cadastrados") || "[]");

        // Procura se existe usuario com esse email e senha
        const usuarioEncontrado = usuariosCadastrados.find(
            (u) => u.email === email && u.senha === senha
        );

        // Se for o usuario de teste padrao
        if (email === "usuario@teste.com" && senha === "123456") {
            const dados = { nome: "Usuário Estudante", email: "usuario@teste.com" };
            localStorage.setItem("token_usuario", "token_mock_12345");
            localStorage.setItem("dados_usuario", JSON.stringify(dados));
            setUsuarioLogado(dados);
            return true;
        }

        if (usuarioEncontrado) {
            const dados = { nome: usuarioEncontrado.nome, email: usuarioEncontrado.email };
            localStorage.setItem("token_usuario", "token_mock_" + Date.now());
            localStorage.setItem("dados_usuario", JSON.stringify(dados));
            setUsuarioLogado(dados);
            return true;
        }

        // Se nao encontrou, lança um erro
        throw new Error("E-mail ou senha incorretos!");
    };

    // Funcao de cadastro simples
    const realizarCadastro = async (nome, email, senha) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const usuarios = JSON.parse(localStorage.getItem("usuarios_cadastrados") || "[]");

        // Verifica se email ja existe
        const existe = usuarios.some((u) => u.email === email);
        if (existe) {
            throw new Error("Este e-mail já está cadastrado!");
        }

        // Salva novo usuario
        usuarios.push({ nome, email, senha });
        localStorage.setItem("usuarios_cadastrados", JSON.stringify(usuarios));
        return true;
    };

    // Funcao de alteracao de senha (area autenticada)
    const alterarSenhaAtual = async (senhaAtual, novaSenha) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulação simples: se a senha atual nao for 123456 e nao bater com mock, falha
        if (senhaAtual !== "123456") {
            throw new Error("A senha atual digitada está incorreta!");
        }
        return true;
    };

    // Funcao de deslogar
    const realizarLogout = () => {
        localStorage.removeItem("token_usuario");
        localStorage.removeItem("dados_usuario");
        setUsuarioLogado(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuarioLogado,
                carregando,
                realizarLogin,
                realizarCadastro,
                alterarSenhaAtual,
                realizarLogout,
                estaAutenticado: !!usuarioLogado
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
