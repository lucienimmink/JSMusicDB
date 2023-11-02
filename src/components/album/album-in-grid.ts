import Album from '@addasoft/musicdbcore/dist/models/Album';
import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import smallMuted from '../../styles/small-muted';
import panel from '../../styles/panel';
import gridItem from '../../styles/grid-item';

@customElement('album-in-grid')
export class AlbumInGrid extends LitElement {
  static get styles() {
    return [smallMuted, gridItem, panel];
  }
  @property({ attribute: false })
  album: Album | undefined;

  @property({ type: Boolean })
  home = false;

  render() {
    return html`
      ${this.album
        ? html`
            <app-link
              href="/letter/${this.album?.artist?.letter
                ?.escapedLetter}/artist/${this.album?.artist
                ?.escapedName}/album/${this.album.escapedName}"
            >
              <div class="panel ${this.home ? 'panel-home' : ''}">
                <album-art
                  artist=${ifDefined(
                    this.album?.artist?.albumArtist || this.album?.artist?.name,
                  )}
                  album="${this.album.name}"
                ></album-art>
                <div class="panel-info color-type-primary-alt">
                  <span>${this.album.name}</span>
                  ${this.album.year === 0
                    ? nothing
                    : html`
                        <span class="small muted"
                          >Year: ${this.album.year}</span
                        >
                      `}
                </div>
              </div>
            </app-link>
          `
        : nothing}
    `;
  }
}
