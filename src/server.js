require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

// albums
const albums = require('./api/albums');
const AlbumService = require('./services/AlbumService');
const AlbumValidator = require('./validator/album');

// songs
const songs = require('./api/songs');
const SongService = require('./services/SongService');
const SongValidator = require('./validator/song');

// users
const users = require('./api/users');
const UserService = require('./services/UserService');
const UserValidator = require('./validator/user');

// authentications
const authentications = require('./api/authentications');
const AuthenticationService = require('./services/AuthenticationService');
const AuthenticationValidator = require('./validator/authentication');

// playlists
const playlists = require('./api/playlists');
const PlaylistService = require('./services/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

// playlist songs
const playlistSongs = require('./api/playlistSongs');
const PlaylistSongService = require('./services/PlaylistSongService');
const PlaylistSongValidator = require('./validator/playlist_song');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationService = require('./services/CollaborationService');
const CollaborationValidator = require('./validator/collaboration');

// playlist activities
const playlistActivities = require('./api/playlistActivities');
const PlaylistActivityService = require('./services/PlaylistActivityService');

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const userService = new UserService();
  const authenticationService = new AuthenticationService();
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(collaborationService);
  const playlistSongService = new PlaylistSongService();
  const playlistActivityService = new PlaylistActivityService();

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        songService,
        playlistService,
        playlistSongService,
        playlistActivityService,
        validator: PlaylistSongValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        playlistService,
        userService,
        collaborationService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: playlistActivities,
      options: {
        playlistService,
        playlistActivityService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

init();
