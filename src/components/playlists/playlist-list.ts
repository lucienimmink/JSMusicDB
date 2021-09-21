import { LitElement, customElement, html, property } from 'lit-element';
import headers from '../../styles/headers';
import container from '../../styles/container';
import responsive from '../../styles/responsive';
import playlists from '../../styles/playlists';

@customElement('playlists-list')
export class LetterNav extends LitElement {
  @property({
    type: Array,
    hasChanged(value: any, oldVal: any) {
      // perhaps this is cutting the corner a bit too much ;)
      return value?.length !== oldVal?.lenght;
    },
  })
  items: Array<any>;

  static get styles() {
    return [headers, container, responsive, playlists];
  }

  constructor() {
    super();
    this.items = [];
  }

  attributeChangedCallback(name: string, oldVal: any, newVal: any) {
    console.log('attribute change: ', name, newVal);
    super.attributeChangedCallback(name, oldVal, newVal);
  }

  _switchPlaylist = function (e: Event) {
    // @ts-ignore
    const switchTo = e?.target?.value;
    e.preventDefault();
    console.log({ switchTo });
  };
  render() {
    return html`
      <div class="playlists">
        <ul class="md-up">
          <li class="header">Playlists</li>
          ${this.items.map(
            (item: any) => html`<li>
              <app-link href="/playlists/${item.id}" flex
                >${item.name}</app-link
              >
            </li>`
          )}
        </ul>
        <select
          id="playlist-selector"
          class="sm-only"
          @change=${(e: Event) => this._switchPlaylist(e)}
        >
          <option disabled selected>Select a playlist</option>
          ${this.items.map(
            (item: any) =>
              html`<option value="${item.id}">${item.name}</option>`
          )}
        </select>
      </div>
    `;
  }
}
