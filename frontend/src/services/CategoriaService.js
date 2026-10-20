import BaseService from "./BaseService";

class CategoriaService extends BaseService {
  constructor() {
    super("/api/v1/categories");
  }

  async listarPorCarteira(walletId, tipo) {
    const params = {};
    if (walletId) params.walletId = walletId;
    if (tipo) params.type = tipo;
    const resposta = await this.api.get(this.endPoint, { params });
    return resposta.data;
  }

  async listarPorTipo(tipo) {
    const params = tipo ? { type: tipo } : {};
    const resposta = await this.api.get(this.endPoint, { params });
    return resposta.data;
  }

  async criarParaCarteira(walletId, categoria) {
    const resposta = await this.api.post(this.endPoint, categoria, {
      params: { walletId }
    });
    return resposta.data;
  }

  async atualizar(id, categoria) {
    const resposta = await this.api.put(`${this.endPoint}/${id}`, categoria);
    return resposta.data;
  }

  async excluir(id) {
    const resposta = await this.api.delete(`${this.endPoint}/${id}`);
    return resposta.data;
  }
}

export default CategoriaService;
