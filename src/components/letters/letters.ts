import { LitElement, customElement, html, property } from 'lit-element';
import './../app-link/app-link';
import musicdb from '../musicdb';
import jumplist from '../../styles/jumplist';

@customElement('letters-nav')
export class LetterNav extends LitElement {
  @property()
  route: string;
  letters: Array<any>;
  static get styles() {
    return [jumplist];
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
      <ul class="jumplist show">
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
