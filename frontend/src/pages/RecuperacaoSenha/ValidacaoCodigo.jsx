import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import OtpInput from "@/components/forms/OtpInput";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const ValidacaoCodigo = () => {
    const [codigo, setCodigo] = useState(Array(6).fill(""));
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const verificar = (e) => {
        e.preventDefault();
        const texto = codigo.join("").trim();
        if (texto.length < 6) {
            setErro("Preencha os 6 dígitos do código enviado por e-mail.");
            return;
        }
        setErro("");
        // A validação real acontece na próxima etapa, junto com a nova senha.
        navigate(`/redefinir-senha/${texto}`);
    };

    return (
        <AuthLayout
            title="Digite o código"
            subtitle="Use o código de 6 dígitos que enviamos para o seu e-mail."
            step={2}
            totalSteps={3}
            footer={<Link to="/login">Voltar para o login</Link>}
        >
            {erro && <Alert>{erro}</Alert>}
            <form onSubmit={verificar} className="stack" noValidate>
                <OtpInput valor={codigo} onChange={setCodigo} />
                <Button type="submit" block>
                    Continuar
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ValidacaoCodigo;
