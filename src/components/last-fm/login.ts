import { localized, t } from '@weavedev/lit-i18next';
import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import buttons from '../../styles/buttons';
import container from '../../styles/container';
import headers from '../../styles/headers';
import login from '../../styles/login';
import modals from '../../styles/modals';
import { animateCSS, animationCSS } from '../../utils/animations';
import {
  authenticate,
  getSK,
  setLastFMUserName,
  setSk,
} from '../../utils/lastfm';
import { infoIcon } from '../icons/info';
import { timesIcon } from '../icons/times';

@customElement('lastfm-login')
@localized()
export class LetterNav extends LitElement {
  username: string;
  password: string;
  @state()
  hasSK: boolean;
  @state()
  hasError: boolean;
  @state()
  showInfoModal: boolean;
  static get styles() {
    return [animationCSS, container, headers, login, buttons, modals];
  }
  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.hasSK = false;
    this.hasError = false;
    this.showInfoModal = false;
    getSK()
      .then((sk: unknown) => {
        this.hasSK = !!sk;
      })
      .catch(() => {
        this.hasSK = false;
      });
  }
  _onSubmit(e: Event) {
    e.preventDefault();
    this.hasError = false;
    // @ts-ignore
    this.username = this.shadowRoot?.querySelector('#username')?.value || '';
    // @ts-ignore
    this.password = this.shadowRoot?.querySelector('#password')?.value || '';
    authenticate({ username: this.username, password: this.password })
      .then(({ session }: { session: any }) => {
        setSk(session.key).then(() => {
          setLastFMUserName(this.username);
          this.hasSK = true;

          // ok, this is quick and dirty; need better solution
          // eslint-disable-next-line no-self-assign
          location.href = location.href;
        });
      })
      .catch(() => {
        this.hasError = true;
      });
  }
  _onSkip(e: Event) {
    e.preventDefault();
    setSk('dummy').then(() => {
      setLastFMUserName('mdb-skipped');
      this.hasSK = true;
      // ok, this is quick and dirty; need better solution
      // eslint-disable-next-line no-self-assign
      location.href = location.href;
    });
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
          <p>${t('content.lastfm.p1')}</p>
          <p>${t('content.lastfm.p2')}</p>
          <p>${t('content.lastfm.p3')}</p>
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
      ${!this.hasSK
        ? html`
            <div class="login">
              <div class="container">
                <h2 class="header">
                  ${t('headers.login.lastfm')}
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
                <form @submit="${(e: Event) => this._onSubmit(e)}">
                  <div class="row">
                    <label for="username">${t('labels.username')}</label>
                    <input
                      type="text"
                      placeholder="${ifDefined(
                        t('labels.placeholders.username') === null
                          ? undefined
                          : t('labels.placeholders.username')
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
                          : t('labels.placeholders.password')
                      )}"
                      required
                      id="password"
                      name="password"
                      .value=${this.password}
                    />
                  </div>
                  <div class="row buttons">
                    <button class="btn btn-primary" type="submit">
                      ${t('buttons.login')}
                    </button>
                    <button
                      class="btn btn-link"
                      type="button"
                      @click="${(e: Event) => this._onSkip(e)}"
                    >
                      ${t('buttons.skip')}
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
