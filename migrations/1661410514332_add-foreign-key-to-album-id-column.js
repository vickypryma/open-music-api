/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.album_id', 'FOREIGN KEY(album_id) REFERENCES albums(album_id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('notes', 'fk_songs.album_id_albums.album_id');
};
