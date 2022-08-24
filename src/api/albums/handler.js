class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);

      const albumId = await this._service.addAlbum(request.payload);

      const response = h.response({
        status: 'success',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAlbumByIdHandler(request) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);

      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putAlbumByIdHandler(request) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;

      await this._service.editAlbumById(id, request.payload);

      return {
        status: 'success',
        message: 'Update album successful',
      };
    } catch (error) {
      return error;
    }
  }

  async deleteAlbumByIdHandler(request) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Delete album successful',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = AlbumsHandler;
