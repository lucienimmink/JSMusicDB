import { css } from 'lit';

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
  @media (min-width: 992px) {
    .container {
      padding-top: 257px;
    }
    album-details {
      position: fixed;
      width: 100vw;
      z-index: 2;
    }
  }
`;
