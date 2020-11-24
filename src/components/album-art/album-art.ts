import { LitElement, customElement, html, css } from "lit-element";
import { Store, get, set } from "idb-keyval";
import { fetchArtForArtist, fetchArtForAlbum } from "./fetchArt";
import { defaultAlbum, defaultArtist, defaultPixel } from "./defaultart";
import { nothing } from 'lit-html';

@customElement('album-art')
export class AlbumArt extends LitElement {
  art: any;
  _cache: any;
  customStore: Store;
  objectFit: string;
  album: any;
  artist: any;
  cache: boolean;
  transparent: boolean

  static get properties() {
    return {
      artist: { type: String },
      album: { type: String },
      art: { type: String },
      cache: { type: Boolean },
      customStore: { type: Object },
      _cache: { type: Object },
      objectFit: { type: String },
      transparent: { type: Boolean }
    };
  }
  static get styles() {
    return css`
      img {
        width: 100%;
        height: 100%;
        transition: all 0.2s ease-in-out;
        background: rgba(255,255,255,0.85);
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
    this.customStore = new Store("album-art-db", "album-art-store");
    this.objectFit = "cover";
    this.cache = false;
    this.transparent = false;
  }
  render() {
    return html`
      <img
        src="${this.art}"
        alt="${this.artist}${this.album? ` - ${this.album}` : ''}"
        style="object-fit: ${this.objectFit}"
        @load=${(e: Event) => {
          // @ts-ignore
          e.target.classList.remove('loading') }
        }
        loading="lazy"
        class="${this.transparent ? 'transparent ' : nothing }"
      />
    `
  }
  async connectedCallback() {
    super.connectedCallback();
    if (!this.artist) {
      return;
    }
    const key = { artist: this.artist, album: this.album };
    if (this._cache[`${this.artist}-${this.album}`]) {
      this.art = this._cache[`${this.artist}-${this.album}`];
      this.dispatch();
      return;
    }
    const cache = await this.getArt(key);
    this.cache = !(this.getAttribute("cache") === "false");
    if (this.cache && cache) {
      this.art = cache;
      this.dispatch();
    } else {
      this.updateArt(key);
    }
  }
  dispatch() {
    const evt = new CustomEvent("art", {
      detail: { art: this.art },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(evt);
  }
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    changedProperties.forEach(async (oldValue: any, propName: string | number | symbol) => {
      this.cache = !(this.getAttribute("cache") === "false");
      if (propName === "artist" || propName === 'album') {
        this.art = defaultPixel;
        this.shadowRoot?.querySelector("img")?.classList.add('loading');
        if (this._cache[`${this.artist}-${this.album}`]) {
          this.art = this._cache[`${this.artist}-${this.album}`];
          this.dispatch();
          return;
        } else {
          const key = { artist: this.artist, album: this.album };
          const cache = await this.getArt(key);
          if (this.cache && cache) {
            this.art = cache;
            this.dispatch();
          } else {
            this.updateArt(key);
          }
        }
      }
    });
  }
  isEmptyArt(art: string) {
    const base = `https://res.cloudinary.com/jsmusicdb-com/image/fetch/`;
    if (art === base || art === `${base}null`) {
      return true;
    }
    return false;
  }
  async getArt({ artist, album }: { artist: string, album: string }) {
    if (!album) {
      return await get(`${artist}`, this.customStore);
    }
    return await get(`${artist}-${album}`, this.customStore);
  }
  async updateArt({ artist, album }: { artist: string, album: string }) {
    let art = `https://res.cloudinary.com/jsmusicdb-com/image/fetch/`;
    if (!album) {
      try {
        art += await fetchArtForArtist(this.artist);
        if (this.isEmptyArt(art)) art = '';
      } catch (e) {
        art = '';
      }
      if (art) {
        this._cache[`${artist}-${album}`] = art;
        if (this.cache) {
          set(`${artist}`, art, this.customStore);
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
        this._cache[`${artist}-${album}`] = art;
        if (this.cache) {
          set(`${artist}-${album}`, art, this.customStore);
        }
      }
      this.art = art || defaultAlbum;
    }
    this.dispatch();
    this.requestUpdate();
  }
}
