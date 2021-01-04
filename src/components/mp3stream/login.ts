import { LitElement, customElement, html } from 'lit-element';
import { nothing } from 'lit-html';

import {
  canLogin,
  getPublicKey,
  authenticate,
  setJwt,
  getJwt,
  setServer,
} from '../../utils/node-mp3stream';
import headers from '../../styles/headers';
import container from '../../styles/container';
import login from '../../styles/login';
import { infoIcon } from '../icons/info';
import buttons from '../../styles/buttons';
import modals from '../../styles/modals';
import { timesIcon } from '../icons/times';
import { animateCSS, animationCSS } from '../../utils/animations';
@customElement('mp3stream-login')
export class LetterNav extends LitElement {
  username: string;
  password: string;
  server: string;
  token: string;
  hasError: boolean;
  showInfoModal: boolean;
  static get styles() {
    return [animationCSS, container, headers, login, buttons, modals];
  }
  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.server = `${location.protocol}//${location.host}`;
    // this.server = 'https://www.arielext.org:16882';
    this.token = '';
    this.hasError = false;
    this.showInfoModal = true;

    getJwt().then((jwt: any) => {
      this.token = jwt;
      this.requestUpdate();
    });
  }
  async _onSubmit(e: Event) {
    e.preventDefault();
    this.hasError = false;
    // @ts-ignore
    this.username = this.shadowRoot?.querySelector('#username')?.value || '';
    // @ts-ignore
    this.password = this.shadowRoot?.querySelector('#password')?.value || '';
    // @ts-ignore
    this.server = this.shadowRoot?.querySelector('#server')?.value || '';
    if (await canLogin(this.server)) {
      const key = await getPublicKey(this.server);
      const encrypted = await this._encrypt(
        { name: this.username, password: this.password },
        key
      );
      const { jwt } = await authenticate(this.server, encrypted);
      if (!jwt) {
        this.hasError = true;
        this.requestUpdate();
        return;
      }
      this.token = jwt;
      await setJwt(this.token);
      await setServer(this.server);
      // this.requestUpdate();

      // ok, this is quick and dirty; need better solution
      // eslint-disable-next-line no-self-assign
      location.href = location.href;
    }
  }
  async _encrypt(user: any, key: any) {
    const encryptionKey = await crypto.subtle.importKey(
      'jwk',
      key,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );
    const payload = new TextEncoder().encode(JSON.stringify(user));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      encryptionKey,
      payload
    );
    return encrypted;
  }
  async _toggleInfo() {
    if (this.showInfoModal) {
      animateCSS(this.shadowRoot?.querySelector('.modal'), 'fadeOut');
      await animateCSS(
        this.shadowRoot?.querySelector('.modal-backdrop'),
        'fadeOut'
      );
    }
    this.showInfoModal = !this.showInfoModal;
    this.requestUpdate();
  }
  render() {
    return html`
      ${!this.token
        ? html`
            <div class="login">
              <div class="container">
                <h2 class="header">
                  Login to node-mp3stream
                  <button
                    class="btn btn-transparent btn-icon"
                    aria-label="toggle information"
                    @click=${this._toggleInfo}
                  >
                    ${infoIcon}
                  </button>
                </h2>
                ${this.hasError
                  ? html`
                      <div class="alert">
                        Please check your username and password
                      </div>
                    `
                  : nothing}
                <form @submit="${(e: Event) => this._onSubmit(e)}">
                  <div class="row">
                    <label for="username">Username</label>
                    <input
                      type="text"
                      placeholder="JohnDoe"
                      required
                      id="username"
                      name="name"
                      .value=${this.username}
                    />
                  </div>
                  <div class="row">
                    <label for="password">Password</label>
                    <input
                      type="password"
                      placeholder="password"
                      required
                      id="password"
                      name="password"
                      .value=${this.password}
                    />
                  </div>
                  <div class="row">
                    <label for="server">Server</label>
                    <input
                      type="text"
                      placeholder="https://www.example.com"
                      required
                      id="server"
                      name="server"
                      .value=${this.server}
                    />
                  </div>
                  <div class="row buttons">
                    <button class="btn btn-primary" type="submit">Login</button>
                  </div>
                </form>
              </div>
            </div>
          `
        : nothing}
      ${this.showInfoModal
        ? html`<div class="modal-wrapper">
            <div class="modal-backdrop"></div>
            <div class="modal">
              <div class="modal-header">
                <h2 class="header">What is this?</h2>
                <button
                  class="btn btn-transparent btn-icon"
                  aria-label="toggle information"
                  @click=${this._toggleInfo}
                >
                  ${timesIcon}
                </button>
              </div>
              <div class="modal-body">
                <p>Welcome to JSMusicDB!</p>
                <p>
                  In order to use this music player you need to provide
                  credentials to the streamer back-end you would like to use.
                </p>
                <p>
                  JSMusicDB is compatible with
                  <a
                    href="https://github.com/lucienimmink/node-mp3stream"
                    target="_blank"
                    rel="noopener"
                    >node-mp3stream</a
                  >, a nodejs based music streamer that you can install and run
                  from your own pc or NAS.
                </p>
                <p>
                  Once installed just provide your username, password and
                  streamer URL as configured in node-mp3stream. We do not store
                  your credentials anywhere.
                </p>
              </div>

              <div class="modal-footer">
                <button class="btn btn-primary" @click=${this._toggleInfo}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>`
        : nothing}
    `;
  }
}
