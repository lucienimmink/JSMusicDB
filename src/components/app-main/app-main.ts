import { LitElement, html } from 'lit-element';
import { outlet } from 'lit-element-router';

@outlet
class Main extends LitElement {
  render() {
    return html`
      <slot></slot>
    `;
  }
}

customElements.define('app-main', Main);
