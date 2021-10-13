import { css } from 'lit';

export default css`
  .jumplist {
    backdrop-filter: blur(2px);
    background: var(--background-seethrough, #f8f9fa);
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
  }
  .player.jumplist {
    height: calc(100% - 130px);
  }
  .jumplist.show {
    display: flex;
  }
  .jumplist li {
    width: 20%;
    align-self: center;
    text-align: center;
  }
  .jumplist a,
  .jumplist app-link {
    padding: 4vh;
    font-size: 1.3rem;
    line-height: 1.3;
    font-weight: 300;
    color: var(--primary, #006ecd);
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    display: block;
    cursor: pointer;
  }
  .jumplist a:hover,
  .jumplist app-link:hover {
    background-color: var(--background3);
  }
  @media (min-width: 768px) {
    .jumplist {
      height: calc(100% - 100px);
      padding: 1rem;
      width: calc(100% - 75px);
    }
    .player.jumplist {
      height: calc(100% - 180px);
    }
  }
`;
