import { createStore, get, set } from 'idb-keyval';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import albumArt from '../../styles/album-art';
import { defaultAlbum, defaultArtist, defaultPixel } from './defaultart';
import { fetchArtForAlbum, fetchArtForArtist } from './fetchArt';

const resizeObserver = new ResizeObserver((entries: any) => {
  for (const entry of entries) {
    const element = entry.target as HTMLImageElement;
    element.setAttribute(
      'width',
      Math.round(Number(entry.contentRect.width)).toString()
    );
    element.setAttribute(
      'height',
      Math.round(Number(entry.contentRect.height)).toString()
    );
    element.dispatchEvent(new CustomEvent('resize', { bubbles: true }));
  }
});

@customElement('album-art')
export class AlbumArt extends LitElement {
  art: any;
  _cache: any;
  customStore: any;
  objectFit: string;
  album: any;
  artist: any;
  transparent: boolean;
  isDefault = false;
  dimension: number;
  ARTBASE = `https://res.cloudinary.com/jsmusicdb-com/image/fetch/f_auto,q_auto`;

  static get properties() {
    return {
      artist: { type: String },
      album: { type: String },
      art: { type: String },
      customStore: { type: Object },
      _cache: { type: Object },
      objectFit: { type: String },
      transparent: { type: Boolean },
    };
  }
  static get styles() {
    return [albumArt];
  }
  constructor() {
    super();
    this.art = defaultPixel;
    this._cache = {};
    this.customStore = createStore('album-art-db', 'album-art-store');
    this.objectFit = 'cover';
    this.transparent = false;
    this.dimension = 300;
  }
  public getDimensions() {
    this.dimension =
      Number(this.shadowRoot?.querySelector('img')?.getAttribute('width')) ||
      this.dimension;
  }
  render() {
    return html`
      <img
        src="${this.art}"
        alt="${this.artist}${this.album ? ` - ${this.album}` : ''}"
        style="object-fit: ${this.objectFit}"
        @load=${(e: Event) => {
          // @ts-ignore
          e.target.classList.remove('loading');
        }}
        @error=${(e: Event) => {
          // @ts-ignore
          e.target.classList.remove('loading');

          if (this.album) {
            // @ts-ignore
            e.target.src = defaultAlbum;
          } else {
            // @ts-ignore
            e.target.src = defaultArtist;
          }
        }}
        loading="lazy"
        class="${this.transparent ? 'transparent ' : ''} ${this.isDefault
          ? 'default'
          : ''}"
        width="${this.dimension}"
        height="${this.dimension}"
      />
    `;
  }
  async connectedCallback() {
    super.connectedCallback();
    this.artist = this.artist === 'undefined' ? undefined : this.artist;
    this.album = this.album === 'undefined' ? undefined : this.album;
    if (!this.artist) {
      return;
    }
    await this.updateComplete;
    this.getDimensions();
    const key = {
      artist: this.artist,
      album: this.album,
      dimension: this.dimension,
    };
    let cacheKey = `${this.dimension}-${this.artist}-${this.album}`;
    if (!key.album) {
      cacheKey = `${this.dimension}-${this.artist}`;
    }
    if (this._cache[cacheKey]) {
      this.art = this._cache[cacheKey];
      this.dispatch();
      return;
    }
    const cache = await this.getArt(key);
    if (cache) {
      this.art = cache;
      this.dispatch();
    } else {
      this.updateArt(key);
    }
    // @ts-ignore
    resizeObserver.observe(this.shadowRoot?.querySelector('img'));
    this.shadowRoot
      ?.querySelector('img')
      ?.addEventListener('resize', async () => {
        this.getDimensions();
        key.dimension = this.dimension;
        key.artist = this.artist;
        key.album = this.album;
        const cache = await this.getArt(key);
        if (cache) {
          this.art = cache;
          this.dispatch();
        } else {
          this.updateArt(key);
        }
      });
  }
  dispatch() {
    const evt = new CustomEvent('art', {
      detail: { art: this.art },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(evt);
  }
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    changedProperties.forEach(
      async (oldValue: any, propName: string | number | symbol) => {
        if (propName === 'artist' || propName === 'album') {
          this.art = defaultPixel;
          this.getDimensions();
          this.shadowRoot?.querySelector('img')?.classList.add('loading');
          let cacheKey = `${this.dimension}-${this.artist}-${this.album}`;
          this.isDefault = false;
          if (!this.album) {
            cacheKey = `${this.dimension}-${this.artist}`;
          }
          if (this._cache[cacheKey]) {
            this.art = this._cache[cacheKey];
            this.dispatch();
            return;
          } else {
            const key = {
              artist: this.artist,
              album: this.album,
              dimension: this.dimension,
            };
            const cache = await this.getArt(key);
            if (cache) {
              this._cache[cacheKey] = cache;
              this.art = cache;
              this.dispatch();
            } else {
              this.updateArt(key);
            }
          }
        }
      }
    );
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
  async getArt({
    artist,
    album,
    dimension,
  }: {
    artist: string;
    album: string;
    dimension: number;
  }) {
    if (!album) {
      return await get(`${dimension}-${artist}`, this.customStore);
    }
    return await get(`${dimension}-${artist}-${album}`, this.customStore);
  }
  async updateArt({
    artist,
    album,
    dimension,
  }: {
    artist: string;
    album: string;
    dimension: number;
  }) {
    let art = this.ARTBASE;
    this.isDefault = false;
    if (!album) {
      // let's resize those larger artist arts we get.
      art += `,w_${dimension},h_${dimension},c_fill/`;
      try {
        let remoteURL = await get(`remoteURL-${artist}`, this.customStore);
        if (!remoteURL) {
          remoteURL = await fetchArtForArtist(this.artist);
          await set(`remoteURL-${artist}`, remoteURL, this.customStore);
        }
        art += remoteURL;
        if (this.isEmptyArt(art)) {
          art = '';
          this.isDefault = true;
        }
      } catch (e) {
        this.isDefault = true;
        art = '';
      }
      if (art) {
        this._cache[`${dimension}-${artist}`] = art;
        set(`${dimension}-${artist}`, art, this.customStore);
      }
      this.art = art || defaultArtist;
    } else {
      // let's resize those larger artist arts we get.
      art += `,w_${dimension},h_${dimension},c_fill/`;
      try {
        let remoteURL = await get(
          `remoteURL-${artist}-${album}`,
          this.customStore
        );
        if (!remoteURL) {
          remoteURL = await fetchArtForAlbum({ artist, album });
          await set(
            `remoteURL-${artist}-${album}`,
            remoteURL,
            this.customStore
          );
        }
        art += remoteURL;
        if (this.isEmptyArt(art)) {
          art = '';
          this.isDefault = true;
        }
      } catch (e) {
        this.isDefault = true;
        art = '';
      }
      if (art) {
        this._cache[`${dimension}-${artist}-${album}`] = art;
        set(`${dimension}-${artist}-${album}`, art, this.customStore);
      }
      this.art = art || defaultAlbum;
    }
    this.dispatch();
    this.requestUpdate();
  }
}
