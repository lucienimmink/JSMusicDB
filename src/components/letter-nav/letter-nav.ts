import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import letterNav from '../../styles/letter-nav';
import { global as EventBus } from '../../utils/EventBus';
import { REFRESH } from '../../utils/musicdb';
import musicdb from '../musicdb';
import './../app-link/app-link';

@customElement('letter-nav')
export class LetterNav extends LitElement {
  @property()
  letter: string;
  @property({ type: Array })
  letters: Array<any>;
  static get styles() {
    return [letterNav];
  }
  constructor() {
    super();
    this.letter = '';
    this.letters = [];
    this._init();
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(REFRESH, this._init, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    EventBus.off(REFRESH, this._init, this);
  }
  private async _init() {
    const mdb: any = await musicdb;
    this.letters = mdb.sortedLetters;
  }

  private _renderLetter(letter: any) {
    return html`
      <li class="${letter.escapedLetter === this.letter ? 'active' : ''}">
        <app-link href="/letter/${letter.escapedLetter}" letter
          >${letter.letter}</app-link
        >
      </li>
    `;
  }

  render() {
    return html`
      <ul>
        ${this.letters.map((letter: any) => this._renderLetter(letter))}
      </ul>
    `;
  }
}
