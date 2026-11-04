import BaseService from "./BaseService";

class AiService extends BaseService {
  constructor() {
    super("/api/v1/wallets");
  }

  // Verifica se a chave do Gemini está configurada no backend
  async obterStatus(walletId) {
    const resposta = await this.api.get(`${this.endPoint}/${walletId}/ai/status`);
    return resposta.data;
  }

  // Gera o diagnóstico inteligente do período selecionado
  async gerarInsights(walletId, params = {}) {
    const resposta = await this.api.get(`${this.endPoint}/${walletId}/ai/insights`, { params });
    return resposta.data;
  }
}

export default AiService;

