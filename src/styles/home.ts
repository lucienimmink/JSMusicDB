import { css } from 'lit-element';

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
  li .album-art {
    margin-right: 1rem;
    flex-grow: 0;
    width: 54px;
    min-width: 54px;
    height: 54px;
    border: 1px solid var(--background3, #f3f4f5);
    box-shadow: 0px 0px 1px var(--primary, #006ecd);
    background: rgba(255, 255, 255, 0.85);
  }
  li .details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  li .time {
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 70px;
    min-width: 70px;
    white-space: nowrap;
  }
  li .playing {
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
  }
  li.dummy {
    filter: blur(4px);
    opacity: 0.8;
  }
  .grid {
    display: flex;
    flex-wrap: wrap;
    margin: 1rem 1rem 3rem;
    justify-content: space-evenly;
  }
  @media (min-width: 768px) {
    app-link:nth-child(11),
    app-link:nth-child(12),
    app-link:nth-child(13),
    app-link:nth-child(14) {
      display: none;
    }
  }
  @media (min-width: 992px) {
    app-link:nth-child(11),
    app-link:nth-child(12),
    app-link:nth-child(13),
    app-link:nth-child(14) {
      display: block;
    }
  }
  @media (min-width: 1200px) {
    app-link:nth-child(13),
    app-link:nth-child(14) {
      display: none;
    }
  }
`;
