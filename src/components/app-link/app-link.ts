import { LitElement, html, css } from 'lit-element';
import { navigator } from 'lit-element-router';

@navigator
export default class Link extends LitElement {
  href: string;
  title: string;
  inline: boolean;
  flex: boolean;
  letter: boolean;
  menu: boolean;
  text: boolean;
  static get properties() {
    return {
      href: { type: String },
      title: { type: String },
      inline: { type: Boolean },
      flex: { type: Boolean },
      letter: { type: Boolean },
      menu: { type: Boolean },
      text: { type: Boolean },
    };
  }
  static get styles() {
    return css`
      a {
        display: flex;
        align-items: center;
        align-content: center;
        height: 100%;
        color: var(--primary, default);
        text-decoration: none;
      }
      span {
        width: 100%;
        display: block;
      }
      .inline {
        display: inline;
      }
      .inline span {
        display: inline;
      }
      .flex {
        display: flex;
      }
      .flex span {
        display: flex;
      }
      .letter {
        color: var(--letter-color, default);
      }
      .text {
        color: var(--text-color, default);
      }
      .menu {
        padding: 15px;
        color: var(--text-color, default);
      }
      @media (min-width: 576px) {
        .menu {
          padding: 25px;
        }
      }
    `;
  }
  constructor() {
    super();
    this.href = '';
    this.title = '';
    this.inline = false;
    this.flex = false;
    this.letter = false;
    this.menu = false;
    this.text = false;
  }
  render() {
    return html`
      <a
        title="${this.title}"
        href="${this.href}"
        @click="${this.linkClick}"
        class="${this.inline ? 'inline ' : ''}${this.flex ? 'flex ' : ''}${this
          .letter
          ? 'letter '
          : ''}
          ${this.menu ? 'menu ' : ''}${this.text ? 'text ' : ''}
        "
      >
        <span><slot></slot></span>
      </a>
    `;
  }
  linkClick(event: { preventDefault: () => void }) {
    event.preventDefault();
    this.navigate(this.href);
  }
  navigate(href: any) {
    throw new Error(`Method not implemented. ${href}`);
  }
}

customElements.define('app-link', Link);
