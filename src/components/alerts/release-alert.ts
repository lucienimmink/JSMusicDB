import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import alert from '../../styles/alert';
import { global as EventBus } from '../../utils/EventBus';
import { getJwt, getRSSFeed, getServer } from '../../utils/node-mp3stream';
import { getSettingByName, TOGGLE_SETTING } from '../../utils/settings';
import musicdb from '../musicdb';

@customElement('release-alert')
export default class ReleaseAlert extends LitElement {
  @property()
  artist: string;
  @state()
  newReleases: Array<any>;
  static get styles() {
    return [alert];
  }
  constructor() {
    super();
    // @ts-ignore
    this.artist = undefined;
    this.newReleases = [];
  }
  connectedCallback() {
    super.connectedCallback();
    this._updateFeed();
    EventBus.on(TOGGLE_SETTING, this._updateFeed, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(TOGGLE_SETTING, this._updateFeed, this);
  }
  async _updateFeed() {
    const feedURL = await getSettingByName('feed');
    if (feedURL) {
      const jwt: any = await getJwt();
      const server: any = await getServer();
      if (jwt && server) {
        const list: Array<any> = [];
        const feed = await getRSSFeed(server, jwt, feedURL);
        const parser = new DOMParser();
        const doc = parser.parseFromString(feed, 'application/xml');
        const items = doc.querySelectorAll('item');
        const mdb: any = await musicdb;
        items.forEach(item => {
          const release = item.querySelector('title')?.innerHTML;
          const splitted = release?.split('-');
          const artist = splitted?.splice(0, 1)[0].trim();
          const album = splitted?.join('-').trim();
          const link = item.querySelector('link')?.innerHTML;
          const mbdArtist = mdb.getArtistByName(artist);
          if (this.artist === mbdArtist?.escapedName) {
            list.push({ artist, album, link });
          }
        });
        this.newReleases = list;
      }
    } else {
      this.newReleases = [];
    }
  }
  private _renderRelease(release: any) {
    return html`New release found:
      <a .href="${release.link}" rel="noopener" target="_blank"
        >${release.album}</a
      >
      <br />`;
  }
  render() {
    return html` ${this.newReleases.length > 0
      ? html`
          <div class="alert alert-new-release">
            ${this.newReleases.map(
              (release: any) => html`${this._renderRelease(release)}`
            )}
          </div>
        `
      : nothing}`;
  }
}
