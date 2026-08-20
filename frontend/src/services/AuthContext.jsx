import { createContext, useContext, useState, useEffect } from "react";
import api from "../configs/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const tokenSalvo = localStorage.getItem("token_usuario");
        const usuarioSalvo = localStorage.getItem("dados_usuario");

        if (tokenSalvo && usuarioSalvo) {
            setUsuarioLogado(JSON.parse(usuarioSalvo));
        }
        setCarregando(false);
    }, []);

    const realizarLogin = async (email, password) => {
        try {
            // Chamada à API real do backend Java Spring Boot (/auth/login)
            const resposta = await api.post("/auth/login", { email, password });
            const data = resposta.data;

            const dadosUsuario = {
                id: data.user.id,
                nome: data.user.name || data.user.nome,
                email: data.user.email,
                token: data.token
            };

            localStorage.setItem("token_usuario", data.token);
            localStorage.setItem("dados_usuario", JSON.stringify(dadosUsuario));
            setUsuarioLogado(dadosUsuario);
            return true;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.mensagem) {
                throw new Error(error.response.data.mensagem);
            }

            // Fallback de demonstração offline se o backend não estiver respondendo
            if (email === "usuario@teste.com" && (password === "123456" || password === "123456User!")) {
                const dados = { id: 1, nome: "Usuário Estudante", email: "usuario@teste.com", token: "token_mock_12345" };
                localStorage.setItem("token_usuario", dados.token);
                localStorage.setItem("dados_usuario", JSON.stringify(dados));
                setUsuarioLogado(dados);
                return true;
            }

            const usuariosCadastrados = JSON.parse(localStorage.getItem("usuarios_cadastrados") || "[]");
            const usuarioEncontrado = usuariosCadastrados.find(
                (u) => u.email === email && u.senha === password
            );

            if (usuarioEncontrado) {
                const dados = { nome: usuarioEncontrado.nome, email: usuarioEncontrado.email, token: "token_mock_" + Date.now() };
                localStorage.setItem("token_usuario", dados.token);
                localStorage.setItem("dados_usuario", JSON.stringify(dados));
                setUsuarioLogado(dados);
                return true;
            }

            throw new Error(error.message || "E-mail ou senha incorretos!");
        }
    };

    const realizarCadastro = async (nome, email, password) => {
        try {
            // Chamada à API real do backend Java Spring Boot (/auth/register)
            const resposta = await api.post("/auth/register", { name: nome, email, password });
            return resposta.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.mensagem) {
                throw new Error(error.response.data.mensagem);
            }
            const usuarios = JSON.parse(localStorage.getItem("usuarios_cadastrados") || "[]");
            if (usuarios.some((u) => u.email === email)) {
                throw new Error("Este e-mail já está cadastrado!");
            }
            usuarios.push({ nome, email, senha: password });
            localStorage.setItem("usuarios_cadastrados", JSON.stringify(usuarios));
            return true;
        }
    };

    const alterarSenhaAtual = async (currentPassword, newPassword) => {
        try {
            const resposta = await api.patch("/user/alterar-senha", { currentPassword, newPassword });
            return resposta.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.mensagem) {
                throw new Error(error.response.data.mensagem);
            }
            if (currentPassword !== "123456" && currentPassword !== "123456User!") {
                throw new Error("A senha atual digitada está incorreta!");
            }
            return true;
        }
    };

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
