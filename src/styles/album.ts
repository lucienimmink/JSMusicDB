import { css } from 'lit-element';

export default css`
  .container {
    display: block;
  }
  .album-details {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  track-in-list {
    cursor: pointer;
    display: block;
  }
  .album-details > track-in-list:first-child {
    margin-top: 1px;
  }
  @media (min-width: 768px) {
    .container {
      padding-top: 254px;
    }
    album-details {
      position: fixed;
      width: 100vw;
      z-index: 2;
    }
  }
`;
