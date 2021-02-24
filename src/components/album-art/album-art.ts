import { LitElement, customElement, html, css } from 'lit-element';
import { createStore, get, set } from 'idb-keyval';
import { fetchArtForArtist, fetchArtForAlbum } from './fetchArt';
import { defaultAlbum, defaultArtist, defaultPixel } from './defaultart';
@customElement('album-art')
export class AlbumArt extends LitElement {
  art: any;
  _cache: any;
  customStore: any;
  objectFit: string;
  album: any;
  artist: any;
  cache: boolean;
  transparent: boolean;
  dimension: number;
  ARTBASE = `https://res.cloudinary.com/jsmusicdb-com/image/fetch/f_auto`;

  static get properties() {
    return {
      artist: { type: String },
      album: { type: String },
      art: { type: String },
      cache: { type: Boolean },
      customStore: { type: Object },
      _cache: { type: Object },
      objectFit: { type: String },
      transparent: { type: Boolean },
    };
  }
  static get styles() {
    return css`
      img {
        width: 100%;
        height: 100%;
        transition: all 0.2s ease-in-out;
        background: rgba(255, 255, 255, 0.85);
      }
      p {
        margin: 0;
      }
      .loading {
        opacity: 0.25;
        filter: blur(5px);
      }
      .transparent {
        background: transparent;
      }
    `;
  }
  constructor() {
    super();
    this.art = defaultPixel;
    this._cache = {};
    this.customStore = createStore('album-art-db', 'album-art-store');
    this.objectFit = 'cover';
    this.cache = false;
    this.transparent = false;
    this.dimension = 300;
  }
  private getDimensions() {
    this.dimension = Math.min(
      Math.max(this.offsetWidth, this.offsetHeight) || 300
    );
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
        loading="lazy"
        class="${this.transparent ? 'transparent ' : ''}"
      />
    `;
  }
  async connectedCallback() {
    super.connectedCallback();
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
    if (this._cache[`${this.dimension}-${this.artist}-${this.album}`]) {
      this.art = this._cache[`${this.dimension}-${this.artist}-${this.album}`];
      this.dispatch();
      return;
    }
    const cache = await this.getArt(key);
    this.cache = !(this.getAttribute('cache') === 'false');
    if (this.cache && cache) {
      this.art = cache;
      this.dispatch();
    } else {
      this.updateArt(key);
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
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    changedProperties.forEach(
      async (oldValue: any, propName: string | number | symbol) => {
        this.cache = !(this.getAttribute('cache') === 'false');
        if (propName === 'artist' || propName === 'album') {
          this.art = defaultPixel;
          this.shadowRoot?.querySelector('img')?.classList.add('loading');
          if (this._cache[`${this.dimension}-${this.artist}-${this.album}`]) {
            this.art = this._cache[
              `${this.dimension}-${this.artist}-${this.album}`
            ];
            this.dispatch();
            return;
          } else {
            const key = {
              artist: this.artist,
              album: this.album,
              dimension: this.dimension,
            };
            const cache = await this.getArt(key);
            if (this.cache && cache) {
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
    if (art === base || art.includes(`fill/null`)) {
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
  async updateArt({ artist, album }: { artist: string; album: string }) {
    let art = this.ARTBASE;
    art += `,w_${this.dimension},h_${this.dimension},c_fill/`;
    if (!album) {
      try {
        art += await fetchArtForArtist(this.artist);
        if (this.isEmptyArt(art)) art = '';
      } catch (e) {
        art = '';
      }
      if (art) {
        this._cache[`${this.dimension}-${artist}`] = art;
        if (this.cache) {
          set(`${this.dimension}-${artist}`, art, this.customStore);
        }
      }
      this.art = art || defaultArtist;
    } else {
      try {
        art += await fetchArtForAlbum({ artist, album });
        if (this.isEmptyArt(art)) art = '';
      } catch (e) {
        art = '';
      }
      if (art) {
        this._cache[`${this.dimension}-${artist}-${album}`] = art;
        if (this.cache) {
          set(`${this.dimension}-${artist}-${album}`, art, this.customStore);
        }
      }
      this.art = art || defaultAlbum;
    }
    this.dispatch();
    this.requestUpdate();
  }
}
