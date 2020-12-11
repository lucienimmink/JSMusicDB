import { LitElement, customElement, html, property } from 'lit-element';
import './../app-link/app-link';
import musicdb from '../musicdb';
import letterNav from '../../styles/letter-nav';
import { REFRESH } from '../../utils/musicdb';

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
    this.addEventListener(
      REFRESH,
      () => {
        this._init();
      },
      { passive: true }
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
