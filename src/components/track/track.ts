import timespan from '@addasoft/timespan';
import { html, LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import smallMuted from '../../styles/small-muted';
import trackNav from '../../styles/track-nav';
import { global as EventBus } from '../../utils/EventBus';
import { UPDATE_PLAYER } from '../../utils/player';
import { pauseIcon } from '../icons/pause';
import { playIcon } from '../icons/play';

@customElement('track-in-list')
export class Track extends LitElement {
  @property()
  track: any;
  @property({ type: String })
  type: string;
  @property({ type: String })
  context: string;
  @property({ type: Boolean })
  showAlbum: boolean;
  @property({ type: Boolean, reflect: true })
  isActive: boolean;

  static get styles() {
    return [smallMuted, trackNav];
  }
  constructor() {
    super();
    this.track = null;
    this.type = 'album';
    this.context = '';
    this.showAlbum = false;
    this.isActive = false;
  }
  _updatePlayer = (target: any, { current }: { current: any }) => {
    this._update(current);
  };
  _update(track: any) {
    if (track?.id === this.track?.id) {
      this.track = { ...track };
      return;
    }
    if (this.track) {
      this.track.isPlaying = false;
      this.track.isPaused = false;
      this.isActive = false;
    }
    this.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback();
    EventBus.on(UPDATE_PLAYER, this._updatePlayer, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.isActive = false;
    EventBus.off(UPDATE_PLAYER, this._updatePlayer, this);
  }
  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('track')) {
      this.isActive = this.track?.isPlaying || this.track?.isPaused;
      if (!this.track?.isPlaying && !this.track?.isPaused) {
        this.isActive = false;
      }
    }
  }

  private _renderTime() {
    return html`${timespan(this.track?.duration)} <br />
      ${this.track?.isPlaying || this.track?.isPaused
        ? html`
            <span class="small muted if-active"
              >${timespan(this.track?.position)}</span
            >
          `
        : nothing}
      ${this.type !== 'album' && !this.track?.isPlaying && !this.track?.isPaused
        ? html` <span class="small muted">${this.track?.type}</span> `
        : nothing}`;
  }
  render() {
    return html`
      <div
        class="track ${this.isActive ? 'active' : ''} ${this.context === 'album'
          ? 'album-track'
          : ''}"
      >
        ${this.type === 'album'
          ? html`
              <span class="num">
                ${this.isActive
                  ? html`
                      ${this.track?.isPlaying
                        ? html`${playIcon}`
                        : html`${pauseIcon}`}
                    `
                  : html` ${this.track?.number} `}
              </span>
            `
          : nothing}
        <span class="title">
          ${this.type !== 'album'
            ? html`
                ${this.isActive
                  ? html`
                      ${this.track.isPlaying
                        ? html`${playIcon}`
                        : html`${pauseIcon}`}
                    `
                  : nothing}
              `
            : nothing}
          ${this.track?.title} <br />
          <span class="small muted"
            >${this.track?.trackArtist}${this.showAlbum
              ? html` • ${this.track?.album?.name}`
              : nothing}</span
          >
        </span>
        <span class="time"> ${this._renderTime()} </span>
      </div>
    `;
  }
}
