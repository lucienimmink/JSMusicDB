import { css } from 'lit';

export default css`
  ol {
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    width: 100%;
  }
  lit-virtualizer {
    overflow: hidden;
  }
  ol li {
    display: block;
    height: 70px;
    border-top: 1px solid transparent;
    border-bottom: 1px solid var(--border-colour);
    box-sizing: border-box;
    width: 100%;
  }
`;
