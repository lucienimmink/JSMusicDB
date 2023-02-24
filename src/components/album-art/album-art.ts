import { createStore, get, set } from 'idb-keyval';
import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import albumArt from '../../styles/album-art';
import { defaultAlbum, defaultArtist, defaultPixel } from './defaultart';
import { fetchArtForAlbum, fetchArtForArtist } from './fetchArt';
import sharedCache from './shared-cache';

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

let intersectionObserver: IntersectionObserver;

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
  isDefault = false;
  @property({ type: Number })
  dimension: number;
  @property({ type: Boolean, attribute: 'no-lazy' })
  noLazy: boolean;
  @property()
  visible: string;
  @state()
  loading: boolean;

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

    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.setAttribute('visible', entry.isIntersecting.toString());
        });
      },
      {
        rootMargin: '250px 0px',
      }
    );
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
    const cached = await this.getCachedUrl();
    if (
      (this.visible === 'true' || changedProperties.get('visible')) &&
      this.art !== cached
    ) {
      this.initArt();
    } else if (
      changedProperties.get('artist') &&
      changedProperties.get('artist') !== this.artist
    ) {
      this.initArt();
    }
  }
  defaultArt() {
    if (this.album) {
      return defaultAlbum;
    }
    return defaultArtist;
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
        class="${this.transparent ? 'transparent ' : ''} ${this.isDefault
          ? 'default'
          : ''} ${this.loading ? 'loading' : ''}"
        width="${this.dimension}"
        height="${this.dimension}"
      />
    `;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    // @ts-ignore
    resizeObserver.unobserve(this);
    intersectionObserver.disconnect();
  }
  async connectedCallback() {
    super.connectedCallback();
    this.artist = this.artist === 'undefined' ? undefined : this.artist;
    this.album = this.album === 'undefined' ? undefined : this.album;
    if (!this.artist) {
      return;
    }
    if (!this.static) {
      resizeObserver.observe(this);
    }
    intersectionObserver.observe(this);
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
    this.loading = true;
    this.getDimensions();
    const key = {
      artist: this.artist,
      album: this.album,
      dimension: this.dimension,
    };
    let cacheKey = `${this.artist}-${this.album}`;
    if (!key.album) {
      cacheKey = `${this.artist}`;
    }
    if (!this.static) {
      this.shadowRoot
        ?.querySelector('img')
        ?.addEventListener('resize', async () => {
          this.getDimensions();
          key.dimension = this.dimension;
          key.artist = this.artist;
          key.album = this.album;
          let cacheKey = `${this.artist}-${this.album}`;
          if (!key.album) {
            cacheKey = `${this.artist}`;
          }
          await this.updateCache(cacheKey, key);
        });
    }
    await this.updateCache(cacheKey, key);
  }
  async updateCache(
    cacheKey: string | number,
    key: { artist: string; album: string; dimension: number }
  ) {
    if (sharedCache[cacheKey]) {
      this.art = this.replaceDimensions(sharedCache[cacheKey], this.dimension);
      this.dispatch();
      return;
    }
    const cache = await this.getArt(key);
    if (cache) {
      sharedCache[cacheKey] = cache;
      this.art = this.replaceDimensions(cache, this.dimension);
      this.dispatch();
    } else {
      this.updateArt(key);
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
  async getArt({
    artist,
    album,
  }: {
    artist: string;
    album: string;
    dimension: number;
  }) {
    if (!album) {
      return await get(`${artist}`, this.customStore);
    }
    return await get(`${artist}-${album}`, this.customStore);
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
      // let's resize those larger artist arts we get; using face detection to crop to their faces
      art += `,w_${dimension},h_${dimension},c_thumb,g_faces/`;
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
        sharedCache[`${artist}`] = art;
        set(`${artist}`, art, this.customStore);
      }
      this.art = art || defaultArtist;
    } else {
      // let's resize those larger album arts we get.
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
        sharedCache[`${artist}-${album}`] = art;
        set(`${artist}-${album}`, art, this.customStore);
      }
      this.art = art || defaultAlbum;
    }
    this.dispatch();
  }
}
