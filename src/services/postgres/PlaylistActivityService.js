const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistActivityService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add activity');
    }
  }

  async getActivities(id) {
    const query = {
      text: `SELECT users.username, songs.title, activities.action, activities.time
      FROM playlist_song_activities activities
      JOIN users ON users.id = activities.user_id
      JOIN songs ON songs.song_id = activities.song_id
      WHERE activities.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistActivityService;
