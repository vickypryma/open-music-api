const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapAlbumToModel } = require('../utils');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING album_id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].album_id) {
      throw new InvariantError('Failed to add album');
    }

    return result.rows[0].album_id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE album_id = $1',
      values: [id],
    };

    const songsQuery = {
      text: 'SELECT song_id as id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const songsResult = await this._pool.query(songsQuery);

    if (!result.rowCount) {
      throw new NotFoundError('Album not found');
    }

    const album = result.rows.map(mapAlbumToModel)[0];
    const songs = songsResult.rows;

    return {
      ...album,
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE album_id = $3 RETURNING album_id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Update failed. Album not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE album_id = $1 RETURNING album_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Delete failed. Album not found');
    }
  }
}

module.exports = AlbumService;
