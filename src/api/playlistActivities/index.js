const PlaylistActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistActivities',
  version: '1.0.0',
  register: async (server, { playlistService, playlistActivityService }) => {
    const handler = new PlaylistActivitiesHandler(playlistService, playlistActivityService);

    server.route(routes(handler));
  },
};
