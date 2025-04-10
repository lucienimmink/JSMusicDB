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
  li,
  ol > a {
    display: flex;
    min-height: 75px;
    border-bottom: 1px solid var(--border-colour);
    box-sizing: border-box;
    width: 100%;
    display: flex;
    padding: 10px 1rem;
    transition: all 0.2s ease-in-out;
  }
  ol > a {
    text-decoration: none;
    color: var(--text-color, #fff);
  }
  ol .album-art,
  ol album-art {
    margin-right: 1rem;
    flex-grow: 0;
    width: 70px;
    aspect-ratio: 1 / 1;
    height: 70px;
    border: 1px solid var(--background2);
    box-shadow: 0px 0px 1px var(--primary);
    background: rgba(255, 255, 255, 0.85);
  }
  ol .details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  ol .time {
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 70px;
    min-width: 70px;
    white-space: nowrap;
    justify-content: center;
    font-variant-numeric: tabular-nums;
    font-family: system-ui;
    text-transform: capitalize;
  }
  ol .playing {
    color: var(--primary);
    transition: color 0.2s ease-in-out;
  }
  li > div,
  ol > a > div {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  ol .heart {
    display: inline-block;
    border-radius: 50%;
    width: 17px;
    height: 17px;
    padding: 5px;
    color: var(--letter-color, #fff);
    background: var(--primary);
    position: absolute;
    top: -8px;
    right: -1px;
  }
  li.dummy {
    filter: blur(4px);
    opacity: 0.8;
  }
  li > a:hover,
  ol > a:hover {
    color: var(--primary);
    background: var(--background2);
  }
  .grid {
    display: flex;
    flex-wrap: wrap;
    margin: var(--distance) 0 3rem;
    justify-content: center;
    --distance: 3vw;
    gap: var(--distance);
  }
  .hq-icon {
    width: 1em;
    display: inline-block;
    position: relative;
    top: 0.1em;
  }
  album-in-grid {
    display: block;
    transition: transform 0.2s ease-in-out;
  }
  @media (min-width: 768px) {
    .grid {
      --distance: 16px;
    }
    album-in-grid:nth-child(9),
    album-in-grid:nth-child(10),
    album-in-grid:nth-child(11),
    album-in-grid:nth-child(12) {
      display: none;
    }
  }
  @media (min-width: 992px) {
    album-in-grid:nth-child(9),
    album-in-grid:nth-child(10) {
      display: block;
    }
  }
  @media (min-width: 1441px) {
    album-in-grid:nth-child(11),
    album-in-grid:nth-child(12) {
      display: block;
    }
  }
`;
