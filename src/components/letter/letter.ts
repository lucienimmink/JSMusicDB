import { localized, t } from '@weavedev/lit-i18next';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import musicdb from '../../components/musicdb';
import grid from '../../styles/grid';
import panel from '../../styles/panel';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import './../app-link/app-link';

@customElement('artists-in-letter')
@localized()
export class Letter extends LitElement {
  @property()
  letter: string;
  @state()
  artists: Array<any>;

  static get styles() {
    return [smallMuted, panel, grid];
  }
  constructor() {
    super();
    this.letter = '';
    this.artists = [];
  }
  getArtists(event: any, l = this.letter) {
    l = decodeURIComponent(l);
    musicdb
      .then((mdb: any) => {
        const activeLetter: any = mdb.letters[l];
        this.artists =
          activeLetter?.sortAndReturnArtistsBy('sortName', 'asc') || [];
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  attributeChangedCallback(name: string, oldvalue: string, newvalue: string) {
    super.attributeChangedCallback(name, oldvalue, newvalue);
    if (name === 'letter') {
      this.getArtists(null, newvalue);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this.getArtists, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this.getArtists, this);
  }
  private _renderArtist(artist: any) {
    return html`
      <app-link
        href="/letter/${artist.letter
          .escapedLetter}/artist/${artist.escapedName}"
      >
        <div class="panel">
          <album-art artist="${artist.albumArtist || artist.name}"></album-art>
          <div class="panel-info color-type-primary-alt">
            <span>${artist.albumArtist || artist.name}</span>
            <span class="small muted"
              >${t('labels.albums')}: ${artist.albums.length}</span
            >
          </div>
        </div>
      </app-link>
    `;
  }
  render() {
    return html` ${this.artists.map((artist: any) =>
      this._renderArtist(artist)
    )}`;
  }
}
