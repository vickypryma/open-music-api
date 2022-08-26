class PlaylistActivitiesHandler {
  constructor(playlistService, playlistActivityService) {
    this._playlistService = playlistService;
    this._playlistActivityService = playlistActivityService;

    this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
  }

  async getActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const activities = await this._playlistActivityService.getActivities(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistActivitiesHandler;
