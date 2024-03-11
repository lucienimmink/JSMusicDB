# JSMusicDB

A music player and database written using LIT and TypeScript. Using modern JavaScript to reduce the normal framework overhead JSMusicDB is less than 120KB while zipped.

## Screenshots

### Desktop

#### Light mode

![Screenshot of JSMusicDB in light mode](https://www.jsmusicdb.com/assets/screenshot-1.webp 'Screenshot of JSMusicDB in light mode')

#### Dark mode

![Screenshot of JSMusicDB in dark mode](https://www.jsmusicdb.com/assets/screenshot-2.webp 'Screenshot of JSMusicDB in dark mode')

#### Mini album details on scroll

![Screenshot of JSMusicDB showing Mini album details on scroll](https://www.jsmusicdb.com/assets/screenshot-8.webp 'Screenshot of JSMusicDB showing Mini album details on scroll')

#### Now playing screen with a spectrum analyzer

![Screenshot of JSMusicDB showing the now-playing screen](https://www.jsmusicdb.com/assets/screenshot-3.webp 'Screenshot of JSMusicDB showing the now-playing screen')

#### Now playing screen with classic LEDs

![Screenshot of JSMusicDB showing the Now playing screen with classic LEDs](https://www.jsmusicdb.com/assets/screenshot-7.webp 'Screenshot of JSMusicDB showing the Now playing screen with classic LEDs')

#### All artists start with the same letter

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

Add the following to your local `.env` file to use last.fm and fanart

```ruby
LASTFM_APIKEY=[your key]
LASTFM_SECRET=[your secret]
FANART_APIKEY=[your key]
```

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:5173/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## PWA

![Build and deploy](https://github.com/lucienimmink/JSMusicDB/workflows/Build%20and%20deploy/badge.svg)

Use [jsmusicdb](https://www.jsmusicdb.com) as frontend if you don't want to host your version.
