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
    flex-direction: row;
    box-sizing: border-box;
    border-top: 1px solid var(--border-colour);
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease-in-out;
    min-height: 60px;
  }
  .track:hover {
    background: var(--background2);
  }
  .track.active {
    background-color: var(--background2-seethrough);
    color: var(--primary);
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
