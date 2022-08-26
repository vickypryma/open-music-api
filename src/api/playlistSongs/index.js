const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    songService,
    playlistService,
    playlistSongService,
    playlistActivityService,
    validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      songService,
      playlistService,
      playlistSongService,
      playlistActivityService,
      validator,
    );

    server.route(routes(playlistSongsHandler));
  },
};
