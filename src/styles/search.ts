import { css } from 'lit';

export default css`
  .container {
    display: block;
  }
  ol {
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    width: 100%;
  }
  ol li {
    display: block;
    height: 70px;
    border-top: 1px solid var(--border-colour);
    box-sizing: border-box;
    width: 100%;
  }
  .header {
    border-top-color: transparent;
  }
  ol app-link {
    display: flex;
    padding: 10px 1rem;
    transition: background-color 0.2s ease-in-out;
  }
  ol app-link:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  album-art {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    flex-grow: 0;
    border: 1px solid var(--background2);
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0px 0px 1px var(--primary);
  }
  .details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    max-width: calc(100vw - 80px);
  }
  .details .artist,
  .details .album {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .track {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    border-top: 1px solid var(--border-colour);
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease-in-out;
    min-height: 60px;
    width: 100%;
    cursor: pointer;
  }
  .track:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  .track .title {
    flex-grow: 1;
  }
  .track .time {
    flex-grow: 0;
    text-align: end;
    width: 65px;
    min-width: 65px;
    font-variant-numeric: tabular-nums;
    font-family: system-ui;
  }
`;
