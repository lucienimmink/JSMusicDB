import Artist from '@addasoft/musicdbcore/dist/models/Artist';
import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import smallMuted from '../../styles/small-muted';
import itemInList from '../../styles/item-in-list';

@customElement('artist-in-list')
export class AlbumInList extends LitElement {
  static get styles() {
    return [smallMuted, itemInList];
  }
  @property({ attribute: false })
  artist: Artist | undefined;

  render() {
    return html`
      ${this.artist
        ? html`
            <app-link
              flex
              text
              href="/letter/${this.artist?.letter?.escapedLetter}/artist/${this
                .artist.escapedName}"
            >
              <album-art
                artist="${this.artist.albumArtist || this.artist.name}"
                dimension="50"
                no-lazy
              ></album-art>
              <div class="details">
                <span class="artist"
                  >${this.artist.albumArtist || this.artist.name}</span
                >
                <span class="small muted"
                  >Albums: ${this.artist?.albums?.length}</span
                >
              </div>
            </app-link>
          `
        : nothing}
    `;
  }
}
