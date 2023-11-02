import Artist from '@addasoft/musicdbcore/dist/models/Artist';
import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import smallMuted from '../../styles/small-muted';
import panel from '../../styles/panel';
import gridItem from '../../styles/grid-item';

@customElement('artist-in-grid')
export class ArtistInGrid extends LitElement {
  static get styles() {
    return [smallMuted, gridItem, panel];
  }
  @property({ attribute: false })
  artist: Artist | undefined;

  render() {
    return html`
      ${this.artist
        ? html`
            <app-link
              href="/letter/${this.artist?.letter?.escapedLetter}/artist/${this
                .artist.escapedName}"
            >
              <div class="panel">
                <album-art
                  artist="${this.artist.albumArtist || this.artist.name}"
                ></album-art>
                <div class="panel-info color-type-primary-alt">
                  <span>${this.artist.albumArtist || this.artist.name}</span>
                  <span class="small muted"
                    >Albums: ${this.artist?.albums?.length}</span
                  >
                </div>
              </div>
            </app-link>
          `
        : nothing}
    `;
  }
}
