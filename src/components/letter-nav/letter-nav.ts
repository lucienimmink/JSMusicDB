import { LitElement, customElement, html, property } from 'lit-element';
import './../app-link/app-link';
import musicdb from '../musicdb';
import letterNav from '../../styles/letter-nav';

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
