class CollaborationsHandler {
  constructor(playlistService, userService, collaborationService, validator) {
    this._playlistService = playlistService;
    this._collaborationService = collaborationService;
    this._userService = userService;
    this._validator = validator;

    this.postCollaboration = this.postCollaboration.bind(this);
    this.deleteCollaboration = this.deleteCollaboration.bind(this);
  }

  async postCollaboration(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._userService.getUserById(userId);

    const collaborationId = await this._collaborationService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaboration(request) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Delete collaboration successful',
    };
  }
}

module.exports = CollaborationsHandler;
