const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapSongToModel } = require('../utils');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING song_id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].song_id) {
      throw new InvariantError('Failed to add song');
    }

    return result.rows[0].song_id;
  }

  async getSongs({ title, performer }) {
    const query = {
      text: 'SELECT song_id as id, title, performer FROM songs',
      values: [],
    };

    if (title) {
      query.text += ' WHERE title ILIKE $1';
      query.values.push(`%${title}%`);
    }

    if (performer) {
      if (title) {
        query.text += ' AND performer ILIKE $2';
      } else {
        query.text += ' WHERE performer ILIKE $1';
      }

      query.values.push(`%${performer}%`);
    }

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE song_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song not found');
    }

    return result.rows.map(mapSongToModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: `UPDATE songs 
            SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6
            WHERE song_id = $7
            RETURNING song_id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Update failed. Song not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE song_id = $1 RETURNING song_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Delete failed. Song not found');
    }
  }
}

module.exports = SongService;
