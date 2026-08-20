import BaseService from "./BaseService";

class CategoriaService extends BaseService {
  constructor() {
    super("/api/v1/categories");
  }

  async listarPorTipo(tipo) {
    const params = tipo ? { type: tipo } : {};
    const resposta = await this.api.get(this.endPoint, { params });
    return resposta.data;
  }
}

export default CategoriaService;
