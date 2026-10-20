import BaseService from "./BaseService";

class CarteiraService extends BaseService {
  constructor() {
    super("/api/v1/wallets");
  }

  async obterResumo(walletId, params = {}) {
    const resposta = await this.api.get(`${this.endPoint}/${walletId}/summary`, { params });
    return resposta.data;
  }

  async atualizar(id, dados) {
    const resposta = await this.api.put(`${this.endPoint}/${id}`, dados);
    return resposta.data;
  }

  async listarMembros(walletId) {
    const resposta = await this.api.get(`${this.endPoint}/${walletId}/members`);
    return resposta.data;
  }

  async adicionarMembro(walletId, dadosMembro) {
    const resposta = await this.api.post(`${this.endPoint}/${walletId}/members`, dadosMembro);
    return resposta.data;
  }

  async alterarPapelMembro(walletId, targetUserId, dadosMembro) {
    const resposta = await this.api.patch(`${this.endPoint}/${walletId}/members/${targetUserId}`, dadosMembro);
    return resposta.data;
  }

  async removerMembro(walletId, targetUserId) {
    const resposta = await this.api.delete(`${this.endPoint}/${walletId}/members/${targetUserId}`);
    return resposta.data;
  }
}

export default CarteiraService;

