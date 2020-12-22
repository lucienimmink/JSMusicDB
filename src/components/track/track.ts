import { LitElement, customElement, html, property } from 'lit-element';
import timeSpan from '../../utils/timespan';
import { UPDATE_PLAYER } from '../../utils/player';
import { playIcon } from '../icons/play';
import { pauseIcon } from '../icons/pause';
import smallMuted from '../../styles/small-muted';
import { nothing } from 'lit-html';
import trackNav from '../../styles/track-nav';
import { global as EventBus } from '../../utils/EventBus';

@customElement('track-in-list')
export class track extends LitElement {
  @property()
  track: any;
  @property({ type: String })
  type: string;

  static get styles() {
    return [smallMuted, trackNav];
  }
  constructor() {
    super();
    this.track = null;
    this.type = 'album';
    this._listen();
  }
  _listen() {
    EventBus.on(
      UPDATE_PLAYER,
      (target: any, { current }: { current: any }) => {
        this._update(current);
      },
      this
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
