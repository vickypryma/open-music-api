const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    playlistService,
    userService,
    collaborationService,
    validator,
  }) => {
    const handler = new CollaborationsHandler(
      playlistService,
      userService,
      collaborationService,
      validator,
    );

    server.route(routes(handler));
  },
};
