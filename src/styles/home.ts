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
  li {
    display: flex;
    min-height: 75px;
    border-top: 1px solid var(--background3);
    box-sizing: border-box;
    width: 100%;
    display: flex;
    padding: 10px 1rem;
    transition: all 0.2s ease-in-out;
  }
  li .album-art,
  li album-art {
    margin-right: 0.75rem;
    flex-grow: 0;
    width: 87px;
    min-width: 87px;
    height: 87px;
    border: 1px solid var(--background3, #f3f4f5);
    box-shadow: 0px 0px 1px var(--primary, #006ecd);
    background: rgba(255, 255, 255, 0.85);
  }
  li .details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  li .time {
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
  }
  li .playing {
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
  }
  li > div {
    position: relative;
  }
  li .heart {
    display: inline-block;
    border-radius: 50%;
    width: 17px;
    height: 17px;
    padding: 5px;
    color: var(--letter-color, #fff);
    background: var(--primary, #006ecd);
    position: absolute;
    top: -8px;
    right: -1px;
  }
  li.dummy {
    filter: blur(4px);
    opacity: 0.8;
  }
  li > a {
    display: flex;
    text-decoration: none;
    color: var(--text-color);
  }
  li > a:hover {
    color: var(--primary);
  }
  .grid {
    display: flex;
    flex-wrap: wrap;
    margin: var(--distance) 0 3rem;
    justify-content: center;
    --distance: 3vw;
    gap: var(--distance);
  }
  @media (min-width: 768px) {
    .grid {
      --distance: 16px;
    }
    app-link:nth-child(11),
    app-link:nth-child(12) {
      display: none;
    }
  }
  @media (min-width: 992px) {
    app-link:nth-child(11),
    app-link:nth-child(12) {
      display: block;
    }
  }
`;
