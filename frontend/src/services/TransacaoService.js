import BaseService from "./BaseService";

class TransacaoService extends BaseService {
  constructor() {
    super("/api/v1/wallets");
  }

  async listarTransacoes(walletId, params = {}) {
    const resposta = await this.api.get(`${this.endPoint}/${walletId}/transactions`, { params });
    return resposta.data;
  }

  async criarTransacao(walletId, categoryId, transacao) {
    const params = categoryId ? { categoryId } : {};
    const resposta = await this.api.post(`${this.endPoint}/${walletId}/transactions`, transacao, { params });
    return resposta.data;
  }

  async atualizarTransacao(walletId, id, categoryId, transacao) {
    const params = categoryId ? { categoryId } : {};
    const resposta = await this.api.put(`${this.endPoint}/${walletId}/transactions/${id}`, transacao, { params });
    return resposta.data;
  }

  async excluirTransacao(walletId, id) {
    const resposta = await this.api.delete(`${this.endPoint}/${walletId}/transactions/${id}`);
    return resposta.data;
  }
}

export default TransacaoService;
