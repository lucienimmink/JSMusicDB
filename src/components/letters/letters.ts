import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './../app-link/app-link';
import musicdb from '../musicdb';
import jumplist from '../../styles/jumplist';
import { REFRESH } from '../../utils/musicdb';
import { global as EventBus } from '../../utils/EventBus';

@customElement('letters-nav')
export class LetterNav extends LitElement {
  @property()
  route: string;
  @property({ type: Boolean })
  hasVisiblePlayer: boolean;
  letters: Array<any>;
  static get styles() {
    return [jumplist];
  }
  constructor() {
    super();
    this.route = '';
    this.letters = [];
    this.hasVisiblePlayer = false;
    this._init();
    this._listen();
  }
  _listen() {
    EventBus.on(
      REFRESH,
      () => {
        this._init();
      },
      this
    );
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
      <ul class="jumplist show ${this.hasVisiblePlayer ? 'player' : ''}">
        ${this.letters.map(
          (letter: any) => html`
            <li class="${letter.escapedLetter === this.route ? 'active' : ''}">
              <app-link href="/letter/${letter.escapedLetter}"
                >${letter.letter}</app-link
              >
            </li>
          `
        )}
      </ul>
    `;
  }
}
