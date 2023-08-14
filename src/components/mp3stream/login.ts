import { localized, t } from '@weavedev/lit-i18next';
import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import headers from '../../styles/headers';
import login from '../../styles/login';
import modals from '../../styles/modals';
import { animateCSS, animationCSS } from '../../utils/animations';
import {
  authenticate,
  canLogin,
  getJwt,
  getPublicKey,
  getServer,
  setJwt,
  setServer,
} from '../../utils/node-mp3stream';
import { infoIcon } from '../icons/info';
import { timesIcon } from '../icons/times';

@customElement('mp3stream-login')
@localized()
export class LetterNav extends LitElement {
  username: string;
  password: string;
  @state()
  server: string;
  token: string;
  @state()
  hasError: boolean;
  @state()
  showInfoModal: boolean;
  @state()
  versionError: boolean;
  static get styles() {
    return [animationCSS, container, headers, login, buttons, modals];
  }
  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.token = '';
    this.server = '';
    this.hasError = false;
    this.showInfoModal = true;
    this.versionError = false;

    getJwt().then(async (jwt: any) => {
      this.token = jwt;
      this.server =
        (await getServer()) || `${location.protocol}//${location.host}`;
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
        key,
      );
      const { jwt } = await authenticate(this.server, encrypted);
      if (!jwt) {
        this.hasError = true;
        return;
      }
      this.token = jwt;
      await setJwt(this.token);
      await setServer(this.server);
      // ok, this is quick and dirty; need better solution
      // eslint-disable-next-line no-self-assign
      location.href = location.href;
    } else {
      this.versionError = true;
    }
  }
  async _encrypt(user: any, key: any) {
    const encryptionKey = await crypto.subtle.importKey(
      'jwk',
      key,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-512',
      },
      false,
      ['encrypt'],
    );
    const payload = new TextEncoder().encode(JSON.stringify(user));
    return crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      encryptionKey,
      payload,
    );
  }
  async _toggleInfo() {
    if (this.showInfoModal) {
      animateCSS(this.shadowRoot?.querySelector('.modal'), 'fadeOut');
      await animateCSS(
        this.shadowRoot?.querySelector('.modal-backdrop'),
        'fadeOut',
      );
    }
    this.showInfoModal = !this.showInfoModal;
  }
  private _renderModal() {
    return html`<div class="modal-wrapper">
      <div class="modal-backdrop"></div>
      <div class="modal">
        <div class="modal-header">
          <h2 class="header">${t('headers.login.whats-this')}</h2>
          <button
            class="btn btn-transparent btn-icon"
            aria-label="toggle information"
            @click=${this._toggleInfo}
          >
            ${timesIcon}
          </button>
        </div>
        <div class="modal-body">
          <p>${t('content.mp3stream.p1')}</p>
          <p>${t('content.mp3stream.p2')}</p>
          <p>${unsafeHTML(t('content.mp3stream.p3'))}</p>
          <p>${t('content.mp3stream.p4')}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click=${this._toggleInfo}>
            ${t('buttons.dismiss')}
          </button>
        </div>
      </div>
    </div>`;
  }
  render() {
    return html`
      ${!this.token
        ? html`
            <div class="login">
              <div class="container">
                <h2 class="header">
                  ${t('headers.login.mp3stream')}
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
                      <div class="alert">${t('errors.username-password')}</div>
                    `
                  : nothing}
                ${this.versionError
                  ? html` <div class="alert">${t('errors.version')}</div> `
                  : nothing}
                <form @submit="${(e: Event) => this._onSubmit(e)}">
                  <div class="row">
                    <label for="username">${t('labels.username')}</label>
                    <input
                      type="text"
                      placeholder="${ifDefined(
                        t('labels.placeholders.username') === null
                          ? undefined
                          : t('labels.placeholders.username'),
                      )}"
                      required
                      id="username"
                      name="name"
                      .value=${this.username}
                    />
                  </div>
                  <div class="row">
                    <label for="password">${t('labels.password')}</label>
                    <input
                      type="password"
                      placeholder="${ifDefined(
                        t('labels.placeholders.password') === null
                          ? undefined
                          : t('labels.placeholders.password'),
                      )}"
                      required
                      id="password"
                      name="password"
                      .value=${this.password}
                    />
                  </div>
                  <div class="row">
                    <label for="server">${t('labels.server')}</label>
                    <input
                      type="text"
                      placeholder="${ifDefined(
                        t('labels.placeholders.server') === null
                          ? undefined
                          : t('labels.placeholders.server'),
                      )}"
                      required
                      id="server"
                      name="server"
                      .value=${this.server}
                    />
                  </div>
                  <div class="row buttons">
                    <button class="btn btn-primary" type="submit">
                      ${t('buttons.submit')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          `
        : nothing}
      ${this.showInfoModal ? this._renderModal() : nothing}
    `;
  }
}
