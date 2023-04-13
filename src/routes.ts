import { Routes } from '@lit-labs/router';
import { html } from 'lit';
import { LitMusicdb } from './LitMusicdb.js';
import { TOGGLE_MENU } from './components/side-nav/side-nav.js';
import { global as EventBus } from './utils/EventBus';
import { animateCSS } from './utils/animations.js';

// @ts-ignore: Property 'UrlPattern' does not exist
if (!globalThis.URLPattern) {
  await import('urlpattern-polyfill');
}

const renderCallback = (html: any, url: string, controller: LitMusicdb) => {
  const pattern = new URLPattern({ pathname: url });
  if (!pattern.test(controller?.route, location.origin)) return; // only do the lifting if needed
  window.scrollTo(0, 0);
  EventBus.emit(TOGGLE_MENU, {}, 'close');
  if (url === '/playing') {
    document.querySelector('html')?.classList.add('noscroll');
  } else {
    document.querySelector('html')?.classList.remove('noscroll');
  }
  if (!url.includes('/playlists/'))
    animateCSS(controller.shadowRoot?.querySelector('#outlet'), 'slideInUp');
  return html;
};

export default (controller: any) =>
  new Routes(controller, [
    {
      name: 'home',
      path: '/',
      render: () => {
        return renderCallback(html`<home-nav></home-nav>`, '/', controller);
      },
      enter: async () => {
        await import('./components/home/home.js');
        return true;
      },
    },
    {
      name: 'letter',
      path: '/letter/:letter',
      render: props => {
        return renderCallback(
          html`<artists-in-letter
            .letter="${props?.letter}"
          ></artists-in-letter>`,
          '/letter/:letter',
          controller
        );
      },
      enter: async () => {
        await import('./components/letter/letter');
        return true;
      },
    },
    {
      name: 'artist',
      // @ts-ignore
      pattern: new URLPattern({
        pathname: '/letter/:letter/artist/:artist',
      }),
      render: props => {
        return renderCallback(
          html`<release-alert .artist="${props.artist}"></release-alert>
            <albums-in-artist .artist="${props.artist}"></albums-in-artist>`,
          '/letter/:letter/artist/:artist',
          controller
        );
      },
      enter: async () => {
        await import('./components/artist/artist');
        return true;
      },
    },
    {
      name: 'album',
      // path: '/letter/:letter/artist:artist',
      pattern: new URLPattern({
        pathname: '/letter/:letter/artist/:artist/album/:album',
      }),
      render: props => {
        return renderCallback(
          html`<tracks-in-album
            .artist="${props.artist}"
            .album="${props.album}"
          ></tracks-in-album>`,
          '/letter/:letter/artist/:artist/album/:album',
          controller
        );
      },
      enter: async () => {
        await import('./components/album/album');
        return true;
      },
    },
    {
      name: 'settings',
      path: '/settings',
      render: () => {
        return renderCallback(
          html`<settings-nav></settings-nav>`,
          '/settings',
          controller
        );
      },
      enter: async () => {
        await import('./components/settings/settings');
        return true;
      },
    },
    {
      name: 'years',
      path: '/years',
      render: () => {
        return renderCallback(
          html`<years-nav
            .hasVisiblePlayer=${controller.showPlayer}
          ></years-nav>`,
          '/years',
          controller
        );
      },
      enter: async () => {
        await import('./components/years/years');
        return true;
      },
    },
    {
      name: 'artists',
      path: '/artists',
      render: () => {
        return renderCallback(
          html`<artists-nav
            .hasVisiblePlayer=${controller.showPlayer}
          ></artists-nav>`,
          '/artists',
          controller
        );
      },
      enter: async () => {
        await import('./components/artists/artists');
        return true;
      },
    },
    {
      name: 'albums',
      path: '/albums',
      render: () => {
        return renderCallback(
          html`<albums-nav
            .hasVisiblePlayer=${controller.showPlayer}
          ></albums-nav>`,
          '/albums',
          controller
        );
      },
      enter: async () => {
        await import('./components/albums/albums');
        return true;
      },
    },
    {
      name: 'letters',
      path: '/letters',
      render: () => {
        return renderCallback(
          html`<letters-nav
            .hasVisiblePlayer=${controller.showPlayer}
          ></letters-nav>`,
          '/letters',
          controller
        );
      },
      enter: async () => {
        await import('./components/letters/letters');
        return true;
      },
    },
    {
      name: 'playlists',
      path: '/playlists',
      render: () => {
        return renderCallback(
          html`<playlists-nav></playlists-nav>`,
          '/letters',
          controller
        );
      },
      enter: async () => {
        await import('./components/playlists/playlists');
        return true;
      },
    },
    {
      name: 'playlist',
      // @ts-ignore
      pattern: new URLPattern({
        pathname: '/playlists/:playlist',
      }),
      render: props => {
        return renderCallback(
          html`<playlists-nav .playlistId="${props.playlist}"></playlists-nav>`,
          '/playlists/:playlist',
          controller
        );
      },
      enter: async () => {
        await import('./components/playlists/playlists');
        return true;
      },
    },
    {
      name: 'search',
      // @ts-ignore
      pattern: new URLPattern({
        pathname: '/search/:query',
      }),
      render: props => {
        return renderCallback(
          html`<search-nav .query="${props?.query}"></search-nav>`,
          '/search/:query',
          controller
        );
      },
      enter: async () => {
        await import('./components/search/search');
        return true;
      },
    },
    {
      name: 'playing',
      path: '/playing',
      render: () => {
        const nowPlaying = controller.shadowRoot?.querySelector('now-playing');
        nowPlaying?.dispatchEvent(
          new CustomEvent('_player', { detail: controller._player })
        );
        return renderCallback(
          html`<now-playing></now-playing>`,
          '/playing',
          controller
        );
      },
      enter: async () => {
        await import('./components/now-playing/now-playing.js');
        return true;
      },
    },
  ]);
