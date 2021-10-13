import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './../app-link/app-link';
import musicdb from '../../components/musicdb';
import smallMuted from '../../styles/small-muted';
import panel from '../../styles/panel';
import letter from '../../styles/letter';

@customElement('artists-in-letter')
export class Letter extends LitElement {
  @property()
  letter: string;
  artists: Array<any>;
  static get styles() {
    return [smallMuted, panel, letter];
  }
  constructor() {
    super();
    this.letter = '';
    this.artists = [];
  }
  attributeChangedCallback(name: any, oldval: any, newval: any) {
    if (name === 'letter') {
      this.getArtists(newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }
  getArtists(l = this.letter) {
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
  render() {
    return html`
      ${this.artists.map(
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
                <span class="small muted">Albums: ${artist.albums.length}</span>
              </div>
            </div>
          </app-link>
        `
      )}
    `;
  }
}
