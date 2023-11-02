import Album from '@addasoft/musicdbcore/dist/models/Album';
import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import smallMuted from '../../styles/small-muted';
import itemInList from '../../styles/item-in-list';

@customElement('album-in-list')
export class AlbumInList extends LitElement {
  static get styles() {
    return [smallMuted, itemInList];
  }
  @property({ attribute: false })
  album: Album | undefined;

  render() {
    return html`
      ${this.album
        ? html`
            <app-link
              flex
              text
              href="/letter/${this.album?.artist?.letter
                ?.escapedLetter}/artist/${this.album?.artist
                ?.escapedName}/album/${this?.album?.escapedName}"
            >
              <album-art
                artist=${ifDefined(
                  this.album?.artist?.albumArtist || this.album?.artist?.name,
                )}
                album="${this.album?.name}"
                dimension="50"
                no-lazy
              ></album-art>
              <div class="details">
                <span class="artist">${this.album.name}</span>
                <span class="small muted"
                  >${this.album?.artist?.albumArtist ||
                  this.album?.artist?.name}</span
                >
              </div>
            </app-link>
          `
        : nothing}
    `;
  }
}
