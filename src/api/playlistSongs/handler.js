class PlaylistSongsHandler {
  constructor(
    songService,
    playlistService,
    playlistSongService,
    playlistActivityService,
    validator,
  ) {
    this._songService = songService;
    this._playlistService = playlistService;
    this._playlistSongService = playlistSongService;
    this._playlistActivityService = playlistActivityService;
    this._validator = validator;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._songService.getSongById(songId);
    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongService.addPlaylistSong(id, songId);
    await this._playlistActivityService.addActivity(id, songId, credentialId, 'add');

    const response = h.response({
      status: 'success',
      message: 'Add song to playlist susccessful',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistService.getPlaylistById(id);
    const songs = await this._playlistSongService.getPlaylistSongs(id);

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs,
        },
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongService.deletePlaylistSong(id, songId);
    await this._playlistActivityService.addActivity(id, songId, credentialId, 'delete');

    return {
      status: 'success',
      message: 'Delete song from playlist successful',
    };
  }
}

module.exports = PlaylistSongsHandler;
