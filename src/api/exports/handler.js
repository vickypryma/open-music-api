class ExportsHandler {
  constructor(playlistService, producerService, validator) {
    this._playlistService = playlistService;
    this._producerService = producerService;
    this._validator = validator;

    this.postExportPlaylistByIdHandler = this.postExportPlaylistByIdHandler.bind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    this._validator.validateExportNotesPayload(request.payload);

    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, owner);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Your request is being processed',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
