import { css } from 'lit-element';

export default css`
  .jumplist {
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-content: space-between;
    display: none;
    z-index: 1;
    height: calc(100% - 50px);
    background: var(--background, #f8f9fa);
    position: fixed;
    width: 100%;
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
    padding: 20px;
    font-size: 1.3rem;
    line-height: 1.3;
    font-weight: 400;
    color: var(--primary, #006ecd);
    transition: color 0.2s ease-in-out;
    text-decoration: none;
    display: block;
  }
  @media (min-width: 768px) {
    .jumplist {
      height: calc(100% - 100px);
      width: calc(100% - 75px);
    }
    .jumplist a,
    .jumplist app-link {
      padding: 40px;
    }
  }
`;
