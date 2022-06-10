import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import jumplist from '../../styles/jumplist';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import { SWITCH_ROUTE } from '../../utils/router';
import musicdb from '../musicdb';
import './../app-link/app-link';

@customElement('letters-nav')
export class LetterNav extends LitElement {
  @property()
  route: string;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  @property({ type: Array })
  letters: Array<any>;
  @state()
  active = false;

  static get styles() {
    return [jumplist];
  }
  constructor() {
    super();
    this.route = '';
    this.letters = [];
    this.hasVisiblePlayer = false;
    this._init();
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._init, this);
    EventBus.on(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._init, this);
    EventBus.off(SWITCH_ROUTE, this.isActiveRoute, this);
  }
  isActiveRoute(event: Event, route: string) {
    this.active = route === 'letters';
  }
  private _init() {
    musicdb
      .then((mdb: any) => {
        this.letters = mdb.sortedLetters;
        this.requestUpdate();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  render() {
    return html`
      ${this.active
        ? html` <ul
            class="jumplist show ${this.hasVisiblePlayer ? 'player' : ''}"
          >
            ${this.letters.map(
              (letter: any) => html`
                <li
                  class="${letter.escapedLetter === this.route ? 'active' : ''}"
                >
                  <app-link href="/letter/${letter.escapedLetter}"
                    >${letter.letter}</app-link
                  >
                </li>
              `
            )}
          </ul>`
        : nothing}
    `;
  }
}
