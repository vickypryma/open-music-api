class UploadsHandler {
  constructor(albumService, storageService, validator) {
    this._albumService = albumService;
    this._storageService = storageService;
    this._validator = validator;

    this.postAlbumsCoverHandler = this.postAlbumsCoverHandler.bind(this);
  }

  async postAlbumsCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
    await this._albumService.updateAlbumCover(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Upload album cover successful',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
