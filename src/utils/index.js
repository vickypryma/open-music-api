/* eslint-disable camelcase */
const mapAlbumToModel = ({
  album_id,
  name,
  year,
  cover,
}) => ({
  id: album_id,
  name,
  year,
  coverUrl: cover,
});

const mapSongToModel = ({
  song_id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id: song_id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = { mapAlbumToModel, mapSongToModel };
