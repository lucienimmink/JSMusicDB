import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { loadingIndicator } from '../../styles/loading-indicator';

@customElement('loading-indicator')
export class Loading extends LitElement {
  static get styles() {
    return [loadingIndicator];
  }
  render() {
    return html`
      <div class="progress-bar">
        <div class="progress-circle"></div>
        <div class="progress-circle"></div>
        <div class="progress-circle"></div>
        <div class="progress-circle"></div>
        <div class="progress-circle"></div>
      </div>
    `;
  }
}
