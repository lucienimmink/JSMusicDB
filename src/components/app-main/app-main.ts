import { outlet } from '@addasoft/lit-element-router';
import { html, LitElement } from 'lit';

@outlet
class Main extends LitElement {
  render() {
    return html` <slot></slot> `;
  }
}

customElements.define('app-main', Main);
