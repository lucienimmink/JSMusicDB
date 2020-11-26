import { LitElement, customElement, html, css } from "lit-element";
import { nothing } from 'lit-html';
import { authenticate, getSK, setSk, setLastFMUserName } from '../../utils/lastfm';
import headers from '../../styles/headers';
import container from '../../styles/container'

@customElement('lastfm-login')
export class LetterNav extends LitElement {
  username: string
  password: string
  hasSK: boolean
  hasError: boolean
  static get styles() {
    return css`
    ${container}
    .container {
      display: block;
    }
    ${headers}
    .header {
      top: 50px;
    }
    .login {
      background: var(--background, #f8f9fa);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
    }
    .alert {
      border: 1px solid red;
      background: rgba(255,0,0,0.2);
      padding: 0.5rem 1rem;
      margin: 50px 1rem -50px;
    }
    form {
      margin-top: 50px;
    }
    .row {
      display: flex;
      flex-direction: column;
      align-items: left;
      padding: 0.5rem 0;
      margin: 0 1rem;
    }
    .row.buttons {
      flex-direction: row;
      align-items: center;
    }
    label {
      font-size: 0.8rem;
    }
    input {
      display: block;
      width: 100%;
      box-sizing: border-box;
      height: calc(1.5em + .75rem + 2px);
      padding: .375rem .75rem;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      border-radius: 0;
      transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }
    .btn {
      display: inline-block;
      font-weight: 400;
      color: #212529;
      text-align: center;
      vertical-align: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      background-color: transparent;
      border: 1px solid transparent;
      padding: .375rem .75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }
    .btn-primary {
      border-color: var(--primary, #006ecd);
      background-color: var(--primary, #006ecd);
      color: var(--letter-color, #fff);
    }
    .btn-primary:hover {
      border-color: var(--primary, #006ecd);
      background-color: var(--primary, #006ecd);
      color: var(--letter-color, #fff);
    }
    .btn-primary:active {
      border-color: var(--primary, #0053A2);
      background-color: var(--primary, #0053A2);
      color: var(--letter-color, #fff);
    }
    .btn + .btn {
      margin-left: 1rem;
    }
    @media (min-width: 768px) {
      .container {
        max-width: 500px;
      }
    }
    `
  }
  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.hasSK = false;
    this.hasError = false;
    getSK().then((sk: unknown) => {
      this.hasSK = !!sk;
      this.requestUpdate();
    }).catch(() => {
      this.hasSK = false;
    })
  }
  _onSubmit (e:Event) {
    e.preventDefault();
    this.hasError = false;
    // @ts-ignore
    this.username = this.shadowRoot?.querySelector("#username")?.value || "";
    // @ts-ignore
    this.password = this.shadowRoot?.querySelector("#password")?.value || "";
    authenticate({ username: this.username, password: this.password}).then(({session}:{session:any}) => {
      setSk(session.key).then(() => {
        setLastFMUserName(this.username);
        this.hasSK = true;

        // ok, this is quick and dirty; need better solution
        // eslint-disable-next-line no-self-assign
        location.href = location.href;
      })
    }).catch(() => {
      this.hasError = true;
      this.requestUpdate();
    })
  }
  _onSkip (e:Event) {
    e.preventDefault();
    setSk('dummy').then(() => {
      setLastFMUserName('mdb-skipped');
      this.hasSK = true;
      // ok, this is quick and dirty; need better solution
      // eslint-disable-next-line no-self-assign
      location.href = location.href;
    })
  }
  render() {
    return html`
    ${!this.hasSK ? html`
      <div class="login">
        <div class="container">
          <h2 class="header">Login to last.fm</h2>
          ${this.hasError ? html`
          <div class="alert">
            Please check your username and password
          </div>
          ` : nothing }
          <form @submit="${(e:Event) => this._onSubmit(e)}">
            <div class="row">
              <label for="username">Username</label>
              <input type="text" placeholder="JohnDoe" required id="username" name="name" .value=${this.username}>
            </div>
            <div class="row">
              <label for="password">Password</label>
              <input type="password" placeholder="password" required id="password" name="password" .value=${this.password}>
            </div>
            <div class="row buttons">
              <button class="btn btn-primary" type="submit">Login</button>
              <button class="btn btn-link" type="button" @click="${(e:Event) => this._onSkip(e)}">Skip</button>
            </div>
          </form>
        </div>
      </div>
      ` : nothing }
    `
  }
}
