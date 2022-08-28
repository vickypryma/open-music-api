const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Add song to playlist failed');
    }
  }

  async getPlaylistSongs(id) {
    const query = {
      text: `SELECT songs.song_id as id, songs.title, songs.performer
      FROM playlist_songs
      JOIN songs ON songs.song_id = playlist_songs.song_id
      JOIN playlists ON playlists.id = playlist_songs.playlist_id
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Delete failed. Song not found');
    }
  }
}

module.exports = PlaylistSongService;
