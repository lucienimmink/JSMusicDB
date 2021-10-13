import { css } from 'lit';

export default css`
  :host {
    display: block;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: flex-start;
    align-items: stretch;
    display: flex;
    padding: 25px 0 0;
  }
  @media (min-width: 768px) {
    :host {
      margin-left: 100px;
      width: calc(100% - 150px);
    }
  }
`;
