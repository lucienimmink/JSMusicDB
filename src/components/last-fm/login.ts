import { LitElement, customElement, html } from 'lit-element';
import { nothing } from 'lit-html';
import {
  authenticate,
  getSK,
  setSk,
  setLastFMUserName,
} from '../../utils/lastfm';
import headers from '../../styles/headers';
import container from '../../styles/container';
import login from '../../styles/login';

@customElement('lastfm-login')
export class LetterNav extends LitElement {
  username: string;
  password: string;
  hasSK: boolean;
  hasError: boolean;
  static get styles() {
    return [container, headers, login];
  }
  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.hasSK = false;
    this.hasError = false;
    getSK()
      .then((sk: unknown) => {
        this.hasSK = !!sk;
        this.requestUpdate();
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
        this.requestUpdate();
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
  render() {
    return html`
      ${!this.hasSK
        ? html`
            <div class="login">
              <div class="container">
                <h2 class="header">Login to last.fm</h2>
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
    `;
  }
}
