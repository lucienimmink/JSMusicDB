import { LitElement, html } from 'lit';
import { outlet } from '@addasoft/lit-element-router';

@outlet
class Main extends LitElement {
  render() {
    return html` <slot></slot> `;
  }
}

customElements.define('app-main', Main);
