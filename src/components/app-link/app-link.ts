import { navigator } from '@addasoft/lit-element-router';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import appLink from '../../styles/app-link';

@customElement('app-link')
@navigator
export default class Link extends LitElement {
  @property()
  href: string;
  @property()
  title: string;
  @property({ type: Boolean })
  inline: boolean;
  @property({ type: Boolean })
  flex: boolean;
  @property({ type: Boolean })
  letter: boolean;
  @property({ type: Boolean })
  menu: boolean;
  @property({ type: Boolean })
  text: boolean;
  static get styles() {
    return [appLink];
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
