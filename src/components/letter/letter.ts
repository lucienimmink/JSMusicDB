import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import musicdb from '../../components/musicdb';
import letter from '../../styles/letter';
import panel from '../../styles/panel';
import smallMuted from '../../styles/small-muted';
import './../app-link/app-link';

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
  attributeChangedCallback(name: string, oldvalue: string, newvalue: string) {
    if (name === 'letter') {
      this.getArtists(newvalue);
    }
    super.attributeChangedCallback(name, oldvalue, newvalue);
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
