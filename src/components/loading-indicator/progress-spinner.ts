import { LitElement, customElement, html } from 'lit-element';
import { progressSpinner } from '../../styles/loading-indicator';

@customElement('progress-spinner')
export class Loading extends LitElement {
  static get styles() {
    return [progressSpinner];
  }
  render() {
    return html`
      <div class="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="text"><slot></slot></div>
    `;
  }
}
