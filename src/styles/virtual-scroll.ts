import { css } from 'lit-element';

export default css`
  ol {
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    width: 100%;
  }
  ol li {
    display: block;
    height: 70px;
    border-top: 1px solid var(--background3);
    box-sizing: border-box;
    width: 100%;
  }
  ol app-link {
    display: flex;
    padding: 10px 1rem;
    transition: background 0.2s ease-in-out;
  }
  ol app-link:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  album-art {
    width: 50px;
    height: 50px;
    margin-right: 0.75rem;
    flex-grow: 0;
    border: 1px solid var(--background3, #f3f4f5);
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0px 0px 1px var(--primary, #006ecd);
  }
  .details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: calc(100vw - 80px);
  }
  .details .artist .details .album {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
