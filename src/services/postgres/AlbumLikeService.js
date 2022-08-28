const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`);
      const { likes } = JSON.parse(result);
      return {
        isCache: true,
        likes,
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = result.rowCount;

      await this._cacheService.set(`album:${albumId}`, JSON.stringify({ likes }));

      return {
        isCache: false,
        likes,
      };
    }
  }

  async updateAlbumLike(userId, albumId) {
    const isLiked = await this.verifyAlbumLike(userId, albumId);
    let message;

    if (isLiked) {
      await this.deleteAlbumLike(userId, albumId);
      message = 'Album unliked';
      return message;
    }

    await this.addAlbumLike(userId, albumId);
    message = 'Album liked';
    return message;
  }

  async addAlbumLike(userId, albumId) {
    const id = `album-like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to like album');
    }

    await this._cacheService.delete(`album:${albumId}`);
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to unlike album');
    }

    await this._cacheService.delete(`album:${albumId}`);
  }

  async verifyAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }
}

module.exports = AlbumLikeService;
