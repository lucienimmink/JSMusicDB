import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import musicdb from '../../components/musicdb';
import letter from '../../styles/letter';
import panel from '../../styles/panel';
import smallMuted from '../../styles/small-muted';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import { SWITCH_ROUTE } from '../../utils/router';
import './../app-link/app-link';

@customElement('artists-in-letter')
export class Letter extends LitElement {
  @property()
  letter: string;
  artists: Array<any>;
  @state()
  active = false;
  static get styles() {
    return [smallMuted, panel, letter];
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
        this.requestUpdate();
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
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this.getArtists, this);
    EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'letter';
  }
  render() {
    return html`
      ${this.active
        ? html` ${this.artists.map(
            (artist: any) => html`
              <app-link
                href="/letter/${artist.letter
                  .escapedLetter}/artist/${artist.escapedName}"
              >
                <div class="panel">
                  <album-art
                    artist="${artist.albumArtist || artist.name}"
                  ></album-art>
                  <div class="panel-info color-type-primary-alt">
                    <span>${artist.albumArtist || artist.name}</span>
                    <span class="small muted"
                      >Albums: ${artist.albums.length}</span
                    >
                  </div>
                </div>
              </app-link>
            `
          )}`
        : nothing}
    `;
  }
}
