export default [
  {
    name: 'home',
    pattern: '',
    data: { title: 'home' },
  },
  {
    name: 'albums',
    pattern: 'albums',
    data: { title: 'extra data' },
  },
  {
    name: 'letters',
    pattern: 'letters',
  },
  {
    name: 'artists',
    pattern: 'artists',
  },
  {
    name: 'albums',
    pattern: 'albums',
  },
  {
    name: 'years',
    pattern: 'years',
  },
  {
    name: 'playlists',
    pattern: 'playlists',
  },
  {
    name: 'playlist',
    pattern: 'playlists/:playlist',
  },
  {
    name: 'now-playing',
    pattern: 'now-playing',
  },
  {
    name: 'settings',
    pattern: 'settings',
  },
  {
    name: 'letter',
    pattern: 'letter/:letter',
  },
  {
    name: 'artist',
    pattern: 'letter/:letter/artist/:artist',
  },
  {
    name: 'album',
    pattern: 'letter/:letter/artist/:artist/album/:album',
  },
  {
    name: 'search',
    pattern: 'search',
  },
  {
    name: 'home',
    pattern: '*',
  },
];
