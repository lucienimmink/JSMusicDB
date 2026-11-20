import { css } from 'lit';

export default css`
  .jumplist {
    backdrop-filter: blur(2px);
    background: var(--background-seethrough);
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-content: space-between;
    display: none;
    z-index: 1;
    height: calc(100% - 50px);
    position: fixed;
    width: 100%;
    box-sizing: border-box;

    &.player {
      height: calc(100% - 130px);
    }
    &.show {
      display: flex;
    }
    li {
      width: 20%;
      align-self: center;
      text-align: center;
    }
    a,
    app-link {
      padding: 4vh;
      font-size: 1.5rem;
      font-weight: 400;
      color: var(--primary);
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      display: block;
      cursor: pointer;

      &:hover {
        background-color: var(--background2);
      }
    }
  }
  @media (min-width: 768px) {
    .jumplist {
      height: calc(100% - 100px);
      padding: 1rem;
      width: calc(100% - 75px);
      &.player {
        height: calc(100% - 180px);
      }
    }
  }
`;
