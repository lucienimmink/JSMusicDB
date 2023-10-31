import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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
          <h2 class="header">What's this?</h2>
          <button
            class="btn btn-transparent btn-icon"
            aria-label="toggle information"
            @click=${this._toggleInfo}
          >
            ${timesIcon}
          </button>
        </div>
        <div class="modal-body">
          <p>Optionally you can connect JSMusicDB to your last.fm account</p>
          <p>
            Recently played tracks and playlists based on your last.fm account
            become available, making it a personal experience!
          </p>
          <p>If you aren't interesed you can always just skip this step.</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click=${this._toggleInfo}>
            Dismiss
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
                  Login to last.fm
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
                    <label for="username">Username:</label>
                    <input
                      type="text"
                      placeholder="John Doe"
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
                  <div class="row buttons">
                    <button class="btn btn-primary" type="submit">Login</button>
                    <button
                      class="btn btn-link"
                      type="button"
                      @click="${(e: Event) => this._onSkip(e)}"
                    >
                      Skip
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
