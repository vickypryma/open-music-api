require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const path = require('path');
const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

// albums
const albums = require('./api/albums');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/album');

// songs
const songs = require('./api/songs');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/song');

// users
const users = require('./api/users');
const UserService = require('./services/postgres/UserService');
const UserValidator = require('./validator/user');

// authentications
const authentications = require('./api/authentications');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const AuthenticationValidator = require('./validator/authentication');

// playlists
const playlists = require('./api/playlists');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

// playlist songs
const playlistSongs = require('./api/playlistSongs');
const PlaylistSongService = require('./services/postgres/PlaylistSongService');
const PlaylistSongValidator = require('./validator/playlist_song');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaboration');

// playlist activities
const playlistActivities = require('./api/playlistActivities');
const PlaylistActivityService = require('./services/postgres/PlaylistActivityService');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// album likes
const albumLikes = require('./api/albumLikes');
const AlbumLikeService = require('./services/postgres/AlbumLikeService');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const userService = new UserService();
  const authenticationService = new AuthenticationService();
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(collaborationService);
  const playlistSongService = new PlaylistSongService();
  const playlistActivityService = new PlaylistActivityService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/covers'));
  const cacheService = new CacheService();
  const albumLikeService = new AlbumLikeService(cacheService);

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
    {
      plugin: Inert,
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
    {
      plugin: _exports,
      options: {
        playlistService,
        producerService: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        albumService,
        storageService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: albumLikes,
      options: {
        albumService,
        albumLikeService,
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
