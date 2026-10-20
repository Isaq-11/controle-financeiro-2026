import { createContext, useContext, useState, useEffect } from "react";
import api from "../configs/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        // Prioriza sessionStorage da aba atual para suportar múltiplas abas com contas diferentes
        const tokenSalvo = sessionStorage.getItem("token_usuario") || localStorage.getItem("token_usuario");
        const usuarioSalvo = sessionStorage.getItem("dados_usuario") || localStorage.getItem("dados_usuario");

        if (tokenSalvo && usuarioSalvo) {
            try {
                setUsuarioLogado(JSON.parse(usuarioSalvo));
            } catch {
                sessionStorage.removeItem("dados_usuario");
                sessionStorage.removeItem("token_usuario");
                localStorage.removeItem("dados_usuario");
                localStorage.removeItem("token_usuario");
            }
        }
        setCarregando(false);
    }, []);

    const realizarLogin = async (email, password) => {
        try {
            // Chamada à API real do backend Java Spring Boot (/auth/login)
            const resposta = await api.post("/auth/login", { email, password });
            const data = resposta.data;

            // Retorno do LoginResponseDTO: { accessToken, tokenType, expiresIn, usuario }
            const userObj = data.usuario || data.user || {};
            const token = data.accessToken || data.token;

            if (!userObj || !userObj.id) {
                throw new Error("Erro ao obter dados do usuário retornado pelo servidor.");
            }

            const dadosUsuario = {
                id: userObj.id,
                nome: userObj.name || userObj.nome,
                email: userObj.email,
                token: token
            };

            sessionStorage.setItem("token_usuario", token);
            sessionStorage.setItem("dados_usuario", JSON.stringify(dadosUsuario));
            localStorage.setItem("token_usuario", token);
            localStorage.setItem("dados_usuario", JSON.stringify(dadosUsuario));
            setUsuarioLogado(dadosUsuario);
            return true;
        } catch (error) {
            if (error.response && error.response.data) {
                const msg = error.response.data.mensagem || error.response.data.message || "Credenciais inválidas!";
                throw new Error(msg);
            }
            throw new Error(error.message || "Falha na comunicação com o servidor.");
        }
    };

    const realizarCadastro = async (nome, email, password) => {
        try {
            // Chamada à API real do backend Java Spring Boot (/auth/register)
            const resposta = await api.post("/auth/register", { name: nome, email, password });
            return resposta.data;
        } catch (error) {
            if (error.response && error.response.data) {
                const msg = error.response.data.mensagem || error.response.data.message || "Erro ao realizar cadastro.";
                throw new Error(msg);
            }
            throw new Error(error.message || "Erro ao realizar cadastro de novo usuário.");
        }
    };

    const alterarSenhaAtual = async (currentPassword, newPassword) => {
        try {
            const resposta = await api.patch("/api/v1/users/me/password", { currentPassword, newPassword });
            return resposta.data;
        } catch (error) {
            if (error.response && error.response.data) {
                const msg = error.response.data.mensagem || error.response.data.message || "A senha atual está incorreta.";
                throw new Error(msg);
            }
            throw new Error(error.message || "Erro ao alterar a senha.");
        }
    };

    const realizarLogout = () => {
        sessionStorage.removeItem("token_usuario");
        sessionStorage.removeItem("dados_usuario");
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
