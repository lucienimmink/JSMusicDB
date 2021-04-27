import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './../app-link/app-link';
import musicdb from '../musicdb';
import letterNav from '../../styles/letter-nav';
import { REFRESH } from '../../utils/musicdb';
import { global as EventBus } from '../../utils/EventBus';

@customElement('letter-nav')
export class LetterNav extends LitElement {
  @property()
  route: string;
  letters: Array<any>;
  static get styles() {
    return [letterNav];
  }
  constructor() {
    super();
    this.route = '';
    this.letters = [];
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
      <ul>
        ${this.letters.map(
          (letter: any) => html`
            <li class="${letter.escapedLetter === this.route ? 'active' : ''}">
              <app-link href="/letter/${letter.escapedLetter}" letter
                >${letter.letter}</app-link
              >
            </li>
          `
        )}
      </ul>
    `;
  }
}
