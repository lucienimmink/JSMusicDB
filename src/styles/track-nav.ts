import { css } from 'lit';

export default css`
  ::-moz-selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  ::selection {
    background-color: var(--primary);
    color: var(--letter-color);
  }
  .track {
    display: flex;
    width: 100%;
    flex-direction: row;
    box-sizing: border-box;
    padding: 0.5rem 1rem;
    transition: all 0.2s ease-in-out;
    min-height: 60px;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    border-bottom: 1px solid var(--border-colour);
  }
  .track:not(.album-track):hover {
    background-color: var(--background2);
  }
  .track.active {
    background-color: var(--primary-seethrough) !important;
    border-bottom-color: var(--primary);
    color: var(--letter-color);
  }
  .num {
    flex-grow: 0;
    width: 35px;
    min-width: 35px;
  }
  .track.active .num svg {
    width: 15px;
  }
  .title {
    flex-grow: 1;
    svg {
      display: inline-block;
      width: 10px;
    }
  }
  .info {
    flex-grow: 0;
    width: 35px;
    min-width: 35px;
    text-align: end;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    transition-delay: 0.25s;
  }
  .track.active .info,
  .track:hover .info {
    opacity: 1;
  }
  .track.active .info {
    transition-delay: 0s;
  }
  .time {
    flex-grow: 0;
    text-align: end;
    width: 45px;
    min-width: 45px;
    font-variant-numeric: tabular-nums;
    font-family: system-ui;
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
`;
