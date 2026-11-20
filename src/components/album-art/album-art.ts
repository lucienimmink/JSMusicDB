import { createStore, get, set } from 'idb-keyval';
import { LitElement, PropertyValues, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import albumArt from '../../styles/album-art';
import {
  defaultAlbumLight,
  defaultArtistLight,
  defaultPixel,
  defaultAlbumDark,
  defaultArtistDark,
} from './defaultart';
import { fetchArtForAlbum, fetchArtForArtist } from './fetchArt';
import sharedCache from './shared-cache';
import { TOGGLE_SETTING, getSettingByName } from './../../utils/settings';
import { global as EventBus } from './../../utils/EventBus';

type ArtKey = {
  artist: string;
  album: string;
  dimension: number;
};

type ArtRequest = ArtKey & {
  mbid: string;
  generation: number;
};

const resizeObserver = new ResizeObserver((entries: any) => {
  for (const entry of entries) {
    const element = entry.target as HTMLElement;
    const dimension = Math.round(Number(entry.contentRect.width)).toString();
    if (element.getAttribute('dimension') !== dimension) {
      element.setAttribute('dimension', dimension);
    }
  }
});

export const SLEEPTIMER = 500;

const intersectionObserver = new IntersectionObserver(
  entries => {
    for (const entry of entries) {
      entry.target.setAttribute('visible', entry.isIntersecting.toString());
    }
  },
  {
    rootMargin: '250px 0px',
  },
);

@customElement('album-art')
export class AlbumArt extends LitElement {
  @property()
  art: any;
  @property({ type: Object })
  customStore: any;
  @property()
  objectFit: string;
  @property()
  album: any;
  @property()
  artist: any;
  @property({ type: Boolean })
  static: boolean;
  @property({ type: Boolean })
  transparent: boolean;
  @property({ type: Number })
  dimension: number;
  @property({ type: Boolean, attribute: 'no-lazy' })
  noLazy: boolean;
  @property()
  visible: string;
  @property()
  mbid: string;
  @state()
  loading: boolean;
  @state()
  isDefault: boolean;
  @state()
  theme: string;
  private artRequestGeneration = 0;

  ARTBASE = `https://res.cloudinary.com/jsmusicdb-com/image/fetch/f_auto,q_auto`;

  static get styles() {
    return [albumArt];
  }
  constructor() {
    super();
    this.art = defaultPixel;
    this.customStore = createStore('album-art-db', 'album-art-store');
    this.objectFit = 'cover';
    this.transparent = false;
    this.dimension = 300;
    this.static = false;
    this.noLazy = false;
    this.visible = 'false';
    this.loading = false;
    this.isDefault = false;
    this.theme = 'light';
    this.mbid = '';
  }
  public getDimensions() {
    this.dimension =
      Number(this.shadowRoot?.querySelector('img')?.getAttribute('width')) ||
      this.dimension;
  }
  replaceDimensions(art: string, dimension: number) {
    return art
      .replace(/w_\d+/g, `w_${dimension}`)
      .replace(/h_\d+/g, `h_${dimension}`);
  }
  async willUpdate(changedProperties: PropertyValues) {
    if (!this.artist || this.artist === 'undefined') return;

    const artPropertiesChanged =
      !this.hasUpdated ||
      changedProperties.has('artist') ||
      changedProperties.has('album') ||
      changedProperties.has('mbid') ||
      changedProperties.has('dimension') ||
      changedProperties.has('noLazy');
    const becameVisible =
      changedProperties.has('visible') && this.visible === 'true';
    if (!this.noLazy && this.visible !== 'true') return;
    if (!artPropertiesChanged && !becameVisible) return;

    const cached = await this.getCachedUrl();
    if (this.art === cached && (becameVisible || !artPropertiesChanged)) return;

    this.initArt();
  }
  defaultArt() {
    if (this.album) {
      return this.theme === 'dark' ? defaultAlbumDark : defaultAlbumLight;
    }
    return this.theme === 'dark' ? defaultArtistDark : defaultArtistLight;
  }
  render() {
    return html`
      <img
        src="${this.art}"
        alt="${this.artist}${this.album ? ` - ${this.album}` : ''}"
        style="object-fit: ${this.objectFit}"
        @load=${() => {
          this.loading = false;
        }}
        @error=${(e: Event) => {
          this.loading = false;
          // @ts-ignore
          e.target.src = this.defaultArt();
        }}
        class="${this.transparent ? 'transparent ' : ''} ${
          this.isDefault ? 'default' : ''
        } ${this.loading && !this.isDefault ? 'loading' : ''}"
        width="${this.dimension}"
        height="${this.dimension}"
        crossorigin="anonymous"
        fetchpriority="high"
        loading="eager"
      />
    `;
  }
  private async setTheme(themeSetting?: string) {
    const theme = themeSetting ?? (await getSettingByName('theme'));
    if (theme === 'system') {
      this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      this.theme = theme;
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    // @ts-ignore
    resizeObserver.unobserve(this);
    intersectionObserver.unobserve(this);
    EventBus.off(TOGGLE_SETTING, this._doToggleSetting, this);
  }
  async connectedCallback() {
    super.connectedCallback();
    void this.setTheme();
    this.artist = this.artist === 'undefined' ? undefined : this.artist;
    this.album = this.album === 'undefined' ? undefined : this.album;
    if (!this.static) {
      resizeObserver.observe(this);
    }
    intersectionObserver.observe(this);
    EventBus.on(TOGGLE_SETTING, this._doToggleSetting, this);
  }
  // @ts-ignore
  async _doToggleSetting(target: any, setting: any) {
    if (setting.setting === 'theme') {
      this.setTheme(setting.value);
    }
  }
  dispatch() {
    const evt = new CustomEvent('art', {
      detail: { art: this.art },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(evt);
  }
  async initArt() {
    if (!this.noLazy) this.loading = true;
    this.getDimensions();
    const request: ArtRequest = {
      artist: this.artist,
      album: this.album,
      dimension: this.dimension,
      mbid: this.mbid,
      generation: ++this.artRequestGeneration,
    };
    const cacheKey = request.album
      ? `${request.artist}-${request.album}`
      : request.artist;
    await this.updateCache(cacheKey, request);
  }
  private _isCurrentArtRequest(request: ArtRequest) {
    return (
      request.generation === this.artRequestGeneration &&
      request.artist === this.artist &&
      request.album === this.album &&
      request.mbid === this.mbid &&
      request.dimension === this.dimension
    );
  }
  private async updateCache(cacheKey: string, request: ArtRequest) {
    if (sharedCache[cacheKey]) {
      if (!this._isCurrentArtRequest(request)) return;
      this.isDefault = false;
      this.art = this.replaceDimensions(
        sharedCache[cacheKey],
        request.dimension,
      );
      this.dispatch();
      return;
    }
    const cache = await this.getArt(request);
    if (!this._isCurrentArtRequest(request)) return;
    if (cache) {
      sharedCache[cacheKey] = cache;
      this.isDefault = false;
      this.art = this.replaceDimensions(cache, request.dimension);
      this.dispatch();
    } else {
      await this.updateArt(request);
    }
  }
  async getCachedUrl() {
    let cacheKey = `${this.artist}-${this.album}`;
    if (!this.album) {
      cacheKey = `${this.artist}`;
    }
    if (sharedCache[cacheKey]) {
      return this.replaceDimensions(sharedCache[cacheKey], this.dimension);
    }
  }
  isEmptyArt(art: string) {
    const base = this.ARTBASE;
    if (
      art === base ||
      art === `${base}/` ||
      art.includes(`null`) ||
      art.endsWith(',c_fill/')
    ) {
      return true;
    }
    return false;
  }
  async getArt({ artist, album }: ArtKey) {
    if (!album) {
      return await get(`${artist}`, this.customStore);
    }
    return await get(`${artist}-${album}`, this.customStore);
  }
  async updateArt(request: ArtRequest) {
    const { artist, album, dimension, mbid } = request;
    let art = this.ARTBASE;
    let isDefault = false;
    if (!album) {
      // let's resize those larger artist arts we get; using face detection to crop to their faces
      art += `,w_${dimension},h_${dimension},c_thumb,g_faces/`;
      try {
        let remoteURL = await get(`remoteURL-${artist}`, this.customStore);
        if (!remoteURL) {
          remoteURL = await fetchArtForArtist(artist, mbid);
          if (remoteURL) {
            try {
              await set(`remoteURL-${artist}`, remoteURL, this.customStore);
            } catch (error) {
              console.error('Unable to cache artist artwork URL:', error);
            }
          }
        }
        if (remoteURL) {
          art += remoteURL;
        }
        if (!remoteURL || this.isEmptyArt(art)) {
          art = '';
          isDefault = true;
        }
      } catch (e) {
        console.error(e);
        isDefault = true;
        art = '';
      }
      if (art) {
        sharedCache[`${artist}`] = art;
        try {
          await set(`${artist}`, art, this.customStore);
        } catch (error) {
          console.error('Unable to cache artist artwork:', error);
        }
      }
    } else {
      // let's resize those larger album arts we get.
      art += `,w_${dimension},h_${dimension},c_fill/`;
      try {
        let remoteURL = await get(
          `remoteURL-${artist}-${album}`,
          this.customStore,
        );
        if (!remoteURL) {
          remoteURL = await fetchArtForAlbum({ artist, album, id: mbid });
          if (remoteURL) {
            try {
              await set(
                `remoteURL-${artist}-${album}`,
                remoteURL,
                this.customStore,
              );
            } catch (error) {
              console.error('Unable to cache album artwork URL:', error);
            }
          }
        }
        if (remoteURL) {
          art += remoteURL;
        }
        if (!remoteURL || this.isEmptyArt(art)) {
          art = '';
          isDefault = true;
        }
      } catch (e) {
        console.error(e);
        isDefault = true;
        art = '';
      }
      if (art) {
        sharedCache[`${artist}-${album}`] = art;
        try {
          await set(`${artist}-${album}`, art, this.customStore);
        } catch (error) {
          console.error('Unable to cache album artwork:', error);
        }
      }
    }

    if (!this._isCurrentArtRequest(request)) return;

    this.isDefault = isDefault;
    this.art = art || this.defaultArt();
    this.dispatch();
  }
}
