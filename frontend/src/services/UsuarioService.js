import BaseService from "./BaseService";

class UsuarioService extends BaseService {
    constructor () {
        super("/user");
    }
}

export default UsuarioService;


// NA TELA DE CADASTRO 
// importar esta classe e a instaciar;
// -- usar const ao inves de function nas telas (como em Login.jsx);
// quando for solicitado o cadastro, no try usar a funcao de inserir do UsuarioService, sempre com await
//      caso nao for possivel inserir, no catch mostrar qual foi o error
//      no finally, alterar o status (carregando por exemplo)

// status [400] = bad request


// EXEMPLO DE TELA DE CADASTRO COM ESTES REQUISITOS
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Card } from 'primereact/card';
// import { InputText } from 'primereact/inputtext';
// import { Password } from 'primereact/password';
// import { Button } from 'primereact/button';
// import { Message } from 'primereact/message';
// import UsuarioService from '../../services/UsuarioService';
// import './Cadastro.css';

// const usuarioService = new UsuarioService();

// const Cadastro = () => {
//   const navigate = useNavigate();
//   const [usuario, setUsuario] = useState({nome:'', email: '', senha: '', confirmacaoSenha:''});
//   const [erro, setErro] = useState('');
//   const [sucesso, setSucesso] = useState('');
//   const [carregando, setCarregando] = useState(false);

//   const realizarCadastro = async (event) => {
//     event.preventDefault();
//     setErro('');
//     setSucesso('');

//     if (usuario.senha !== usuario.confirmacaoSenha) {
//       setErro('A confirmacao de senha nao confere.');
//       return;
//     }    
//       setCarregando(true);
//     try {
//       await usuarioService.inserir(usuario);
//       setSucesso('Cadastro realizado com sucesso.');
      
//     } catch (erroCadastro) {
//       const mensagem =
//         erroCadastro?.response?.data?.mensagem ||
//         'Nao foi possivel realizar o cadastro.';
//       setErro(mensagem);
//     } finally {
//       setCarregando(false);
//     }

//   };

//   const handleChange = (e) =>{
//     setUsuario({...usuario,[e.target.name]:e.target.value});
//   }


//   return (
//     <div className="pagina-autenticacao">
//       <Card title="Novo Cadastro" className="cartao-autenticacao">
//         <form onSubmit={realizarCadastro} className="formulario-autenticacao">
//           <span className="p-float-label">
//             <InputText
//               id="register-name"
//               name="nome"
//               value={usuario.nome}
//               onChange={handleChange}
//               className="w-full"
//             />
//             <label htmlFor="register-name">Nome</label>
//           </span>

//           <span className="p-float-label">
//             <InputText
//               id="register-email"
//               name="email"
//               value={usuario.email}
//               onChange={handleChange}
//               className="w-full"
//             />
//             <label htmlFor="register-email">Email</label>
//           </span>

//           <span className="p-float-label">
//             <Password
//               id="register-password"
//               name="senha"
//               value={usuario.senha}
//               onChange={handleChange}
//               feedback={false}
//               toggleMask
//               className="w-full"
//               inputClassName="w-full"
//             />
//             <label htmlFor="register-password">Senha</label>
//           </span>

//           <span className="p-float-label">
//             <Password
//               id="register-confirm-password"
//               name="confirmacaoSenha"
//               value={usuario.confirmacaoSenha}
//               onChange={handleChange}
//               feedback={false}
//               toggleMask
//               className="w-full"
//               inputClassName="w-full"
//             />
//             <label htmlFor="register-confirm-password">Confirmar senha</label>
//           </span>

//           {erro && <Message severity="error" text={erro} />}
//           {sucesso && <Message severity="success" text={sucesso} />}

//           <Button
//             type="submit"
//             label="Cadastrar"
//             className="w-full"
//             loading={carregando}
//           />

//           <div className="links-autenticacao">
//             <Link to="/login">Voltar para login</Link>
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default Cadastro;