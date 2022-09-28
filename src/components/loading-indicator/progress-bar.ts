import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { progressBar } from '../../styles/loading-indicator';

@customElement('progress-bar')
export class Loading extends LitElement {
  @property({ type: Number })
  progress: number;
  static get styles() {
    return [progressBar];
  }
  constructor() {
    super();
    this.progress = 0;
  }
  render() {
    return html`<div class="progress">
      <div class="text"><slot></slot></div>
      <div class="progress-bar">
        <div style="width: ${this.progress}%"></div>
      </div>
    </div>`;
  }
}
