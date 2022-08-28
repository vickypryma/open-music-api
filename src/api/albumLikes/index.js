const AlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albumLikes',
  version: '1.0.0',
  register: async (server, { albumService, albumLikeService }) => {
    const albumLikesHandler = new AlbumLikesHandler(albumService, albumLikeService);
    server.route(routes(albumLikesHandler));
  },
};
