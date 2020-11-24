import { LitElement, customElement, html, css, property } from 'lit-element';
import './../app-link/app-link';
import musicdb from '../musicdb';

@customElement('letter-nav')
export class LetterNav extends LitElement {
  @property()
  route: string;
  letters: Array<any>;
  static get styles() {
    return css`
      ul {
        background-color: var(--primary);
        display: flex;
        height: 50px;
        flex-wrap: wrap;
        padding-left: 0;
        margin-top: 0;
        margin-bottom: 0;
        list-style: none;
        transition: background 0.2s ease-in-out;
      }
      li {
        text-align: center;
        align-self: stretch;
        flex-grow: 1;
        box-sizing: border-box;
      }
      app-link {
        color: var(--letter-color);
        cursor: pointer;
        display: block;
        height: 100%;
        transition: background 0.2s ease-in;
      }
      app-link:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      .active app-link {
        background-color: rgba(0, 0, 0, 0.2);
      }
    `;
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
