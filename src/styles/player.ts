import { css } from 'lit';

export default css`
  :host {
    background: var(--background2);
    box-shadow: 0 7px 11px var(--text-color);
    transition: background-color 0.5s ease-in-out;
  }
  ::-moz-selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  ::selection {
    background-color: var(--primary);
    color: var(--letter-color);
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
    justify-content: center;
    flex-grow: 1;
    flex-shrink: 0;
    width: calc(100% - 75px - 145px);
    margin-top: -8px;
    max-width: calc(100% - 75px - 145px);
    overflow: hidden;
    transition: color 0.5s ease-in-out;
  }
  .details app-link {
    color: var(--primary);
    transition: color 0.2s ease-in-out;
  }
  .art {
    width: 75px;
    min-width: 75px;
    margin-right: 0.75rem;
    background: rgba(255, 255, 255, 0.85);
  }
  h4 {
    font-weight: 400;
    font-size: 1.25rem;
    margin: 0px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  h5 {
    font-weight: 400;
    font-size: 1rem;
    margin: 3px 0 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  h5 .album-details {
    display: none;
  }
  .error {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (min-width: 576px) {
    album-art {
      margin-right: 1rem;
    }
    h4 {
      font-size: 1.5rem;
    }
    h5 {
      font-size: 1.25rem;
    }
    .details {
      width: calc(100% - 400px);
    }
    h5 .album-details {
      display: inline;
    }
  }
`;
