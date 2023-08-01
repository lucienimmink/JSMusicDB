import { html, LitElement } from 'lit';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { customElement, property } from 'lit/decorators.js';
import appLink from '../../styles/app-link';
import { global as EventBus } from '../../utils/EventBus';
import { CHANGE_URL } from '../../utils/router';

@customElement('app-link')
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
    // @ts-ignore
    this.href = undefined;
    // @ts-ignore
    this.title = undefined;
    this.inline = false;
    this.flex = false;
    this.letter = false;
    this.menu = false;
    this.text = false;
  }
  render() {
    return html`
      <a
        title="${ifDefined(this.title)}"
        href="${ifDefined(this.href)}"
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
  linkClick(event: Event) {
    event.preventDefault();
    window.history.pushState({ path: this.href }, '', this.href);
    window.scrollTo(0, 0);
    // @ts-ignore
    if (!document?.startViewTransition) {
      EventBus.emit(CHANGE_URL, this, this.href);
      return;
    }
    // @ts-ignore
    document.startViewTransition(() => {
      EventBus.emit(CHANGE_URL, this, this.href);
      if (event.target) {
        const target = event.target as HTMLElement;
        // @ts-ignore
        target.style.viewTransitionName = '';
      }
    });
  }
}
