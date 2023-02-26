import { Routes } from '@lit-labs/router';
import { html } from 'lit';
import { TOGGLE_MENU } from './components/side-nav/side-nav.js';
import { animateCSS } from './utils/animations.js';
import { global as EventBus } from './utils/EventBus';

const renderCallback = (html: any, url: string, controller: HTMLElement) => {
  window.scrollTo(0, 0);
  EventBus.emit(TOGGLE_MENU, {}, 'close');
  if (url === '/playing') {
    document.querySelector('html')?.classList.add('noscroll');
    return;
  }
  document.querySelector('html')?.classList.remove('noscroll');
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
      // @ts-ignore
      enter: async () => {
        await import('./components/home/home.js');
      },
    },
    {
      name: 'letter',
      path: '/letter/:letter',
      render: props => {
        return renderCallback(
          html`<artists-in-letter
            letter="${props?.letter}"
          ></artists-in-letter>`,
          '/letter/:letter',
          controller
        );
      },
      // @ts-ignore
      enter: async () => {
        await import('./components/letter/letter');
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
          html`<release-alert artist="${props.artist}"></release-alert>
            <albums-in-artist artist="${props.artist}"></albums-in-artist>`,
          '/letter/:letter/artist/:artist',
          controller
        );
      },
      // @ts-ignore
      enter: async () => {
        await import('./components/artist/artist');
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
            artist="${props.artist}"
            album="${props.album}"
          ></tracks-in-album>`,
          '/letter/:letter/artist/:artist/album/:album',
          controller
        );
      },
      // @ts-ignore
      enter: async () => {
        await import('./components/album/album');
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
      // @ts-ignore
      enter: async () => {
        await import('./components/settings/settings');
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
      // @ts-ignore
      enter: async () => {
        await import('./components/years/years');
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
      // @ts-ignore
      enter: async () => {
        await import('./components/artists/artists');
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
      // @ts-ignore
      enter: async () => {
        await import('./components/albums/albums');
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
      // @ts-ignore
      enter: async () => {
        await import('./components/letters/letters');
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
      // @ts-ignore
      enter: async () => {
        await import('./components/playlists/playlists');
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
          html`<playlists-nav playlist-id="${props.playlist}"></playlists-nav>`,
          '/playlists/:playlist',
          controller
        );
      },
      // @ts-ignore
      enter: async () => {
        await import('./components/playlists/playlists');
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
          html`<search-nav query="${props?.query}"></search-nav>`,
          '/search/:query',
          controller
        );
      },
      // @ts-ignore
      enter: async () => {
        await import('./components/search/search');
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
          '/',
          controller
        );
      },
      // @ts-ignore
      enter: async () => {
        await import('./components/now-playing/now-playing.js');
      },
    },
  ]);
