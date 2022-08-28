class AlbumLikesHandler {
  constructor(albumService, albumLikeService) {
    this._albumService = albumService;
    this._albumLikeService = albumLikeService;

    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumService.getAlbumById(id);
    const message = await this._albumLikeService.updateAlbumLike(userId, id);

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const { isCache, likes } = await this._albumLikeService.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (isCache) response.header('X-Data-Source', 'cache');

    return response;
  }
}

module.exports = AlbumLikesHandler;
