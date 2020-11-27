import { LitElement, customElement, html, css, property } from 'lit-element';
import timeSpan from '../../utils/timespan';
import { UPDATE_PLAYER } from '../../utils/player';
import { playIcon } from '../icons/play';
import { pauseIcon } from '../icons/pause';
import smallMuted from '../../styles/small-muted';
import { nothing } from 'lit-html';

@customElement('track-in-list')
export class track extends LitElement {
  @property()
  track: any;
  @property({ type: String })
  type: string;

  static get styles() {
    return [
      smallMuted,
      css`
        ${smallMuted}
        li {
          display: flex;
          flex-direction: row;
          box-sizing: border-box;
          border-top: 1px solid var(--background3);
          padding: 0.5rem 1rem;
          transition: background 0.2s ease-in-out;
          min-height: 60px;
        }
        li:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        li.active {
          background: var(--primary, #006ecd);
          color: var(--letter-color);
          transition: color 0.2s ease-in-out;
        }
        .num {
          flex-grow: 0;
          width: 35px;
          min-width: 35px;
        }
        .title {
          flex-grow: 1;
        }
        .time {
          flex-grow: 0;
          text-align: end;
          width: 65px;
          min-width: 65px;
        }
        .if-active {
          display: none;
        }
        svg {
          width: 15px;
          display: block;
          margin-top: 6px;
        }
        .active .if-active {
          display: inline;
        }
      `,
    ];
  }
  constructor() {
    super();
    this.track = null;
    this.type = 'album';
    this.addEventListener(
      UPDATE_PLAYER,
      (e: any) => {
        this._update(e.detail);
      },
      {
        passive: true,
      }
    );
  }
  _update(track: any) {
    if (track.id === this.track.id) {
      this.track = { ...track };
      this.requestUpdate();
      return;
    }
    this.track.isPlaying = false;
    this.track.isPaused = false;
    this.requestUpdate();
  }

  render() {
    return html`
      <li
        class="${this.track.isPlaying || this.track.isPaused ? 'active' : ''}"
      >
        ${this.type === 'album'
          ? html`
              <span class="num">
                ${this.track.isPlaying || this.track.isPaused
                  ? html`
                      ${this.track.isPlaying
                        ? html`${playIcon}`
                        : html`${pauseIcon}`}
                    `
                  : html` ${this.track.number} `}
              </span>
            `
          : nothing}
        <span class="title">
          ${this.track.title} <br />
          <span class="small muted">${this.track.trackArtist}</span>
        </span>
        <span class="time">
          ${timeSpan(this.track.duration)} <br />
          ${this.track.position > 0 && this.type === 'album'
            ? html`
                <span class="small muted if-active"
                  >${timeSpan(this.track.position)}</span
                >
              `
            : nothing}
          ${this.type !== 'album'
            ? html` <span class="small muted">${this.track.type}</span> `
            : nothing}
        </span>
      </li>
    `;
  }
}
