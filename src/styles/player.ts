import { css } from 'lit-element';

export default css`
  :host {
    background: var(--background3, #e9ecef);
    box-shadow: 0 7px 11px var(--text-color);
  }
  audio {
    display: none;
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .details {
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex-grow: 1;
    flex-shrink: 0;
    width: calc(100% - 75px - 145px);
    max-width: calc(100% - 75px - 145px);
    overflow: hidden;
  }
  .details app-link {
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
  }
  .art {
    width: 75px;
    min-width: 75px;
    margin-right: 0.5rem;
    background: rgba(255, 255, 255, 0.85);
  }
  h4 {
    font-weight: 400;
    font-size: 1.3rem;
    margin: 8px 0px 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  h5 {
    font-weight: 400;
    font-size: 1.1rem;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  @media (min-width: 576px) {
    album-art {
      margin-right: 1rem;
    }
    h4 {
      font-weight: 400;
      font-size: 1.5rem;
      margin: 4px 0 0;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    h5 {
      font-weight: 400;
      font-size: 1.2rem;
      margin: 0;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .details {
      width: calc(100% - 400px);
    }
  }
`;
