# JSMusicDB

A web standards based music database and player written using Lit and TypeScript. Using modern JavaScript to reduce the normal framework overhead JSMusicDB is less then 80KB while zipped.

## Screenshots

### Desktop

#### Light mode

![Screenshot of JSMusicDB in light mode](https://www.jsmusicdb.com/assets/screenshot-1.webp 'Screenshot of JSMusicDB in light mode')

#### Dark mode

![Screenshot of JSMusicDB in dark mode](https://www.jsmusicdb.com/assets/screenshot-2.webp 'Screenshot of JSMusicDB in dark mode')

#### Now playing screen with spectrum analyser

![Screenshot of JSMusicDB showing the now-playing screen](https://www.jsmusicdb.com/assets/screenshot-3.webp 'Screenshot of JSMusicDB showing the now-playing screen')

#### All artists starting the the same letter

![Screenshot of JSMusicDB letter view](https://www.jsmusicdb.com/assets/screenshot-4.webp 'Screenshot of JSMusicDB letter view')

#### Endless list of all albums

![Screenshot of JSMusicDB albums vies](https://www.jsmusicdb.com/assets/screenshot-5.webp 'Screenshot of JSMusicDB albums view')

#### Various playlists

![Screenshot of JSMusicDB playlist view](https://www.jsmusicdb.com/assets/screenshot-6.webp 'Screenshot of JSMusicDB playlist view')

### Mobile

![Screenshot of JSMusicDB in light mode](https://www.jsmusicdb.com/assets/screenshot-1-xs.webp 'Screenshot of JSMusicDB in light mode')
![Screenshot of JSMusicDB in dark mode](https://www.jsmusicdb.com/assets/screenshot-2-xs.webp 'Screenshot of JSMusicDB in dark mode')
![Screenshot of JSMusicDB showing the now-playing screen](https://www.jsmusicdb.com/assets/screenshot-3-xs.webp 'Screenshot of JSMusicDB showing the now-playing screen')
![Screenshot of JSMusicDB letter view](https://www.jsmusicdb.com/assets/screenshot-4-xs.webp 'Screenshot of JSMusicDB letter view')
![Screenshot of JSMusicDB albums vies](https://www.jsmusicdb.com/assets/screenshot-5-xs.webp 'Screenshot of JSMusicDB albums view')
![Screenshot of JSMusicDB playlist view](https://www.jsmusicdb.com/assets/screenshot-6-xs.webp 'Screenshot of JSMusicDB playlist view')

## API keys

Add the following to your local `.env` file in order to use last.fm and fanart

```ruby
LASTFM_APIKEY=[your key]
LASTFM_SECRET=[your secret]
FANART_APIKEY=[your key]
```

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:8000/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## PWA

![Build and deploy](https://github.com/lucienimmink/JSMusicDB/workflows/Build%20and%20deploy/badge.svg)

Use [jsmusicdb](https://www.jsmusicdb.com) as front-end if you don't want to host your own version.
