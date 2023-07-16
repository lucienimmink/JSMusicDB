import { css } from 'lit';

export default css`
  .panel {
    width: 44vw;
    height: 44vw;
    cursor: pointer;
    background-size: contain;
    position: relative;
    border: 1px solid var(--background2, #f3f4f5);
    box-shadow: 0px 0px 1px var(--primary, #006ecd);
    box-sizing: border-box;
    transition: transform 0.15s ease-in-out;
  }
  .panel-home {
    width: 45vw;
    height: 45vw;
  }
  @media (min-width: 576px) {
    .panel {
      width: 19vw;
      height: 19vw;
    }
  }
  @media (min-width: 768px) {
    .panel {
      width: 15vw;
      height: 15vw;
    }
    .panel-home {
      width: 167px;
      height: 167px;
    }
  }
  @media (min-width: 992px) {
    .panel {
      width: 14vw;
      height: 14vw;
      max-width: 300px;
      max-height: 300px;
    }
    .panel-home {
      width: 159px;
      height: 159px;
    }
  }
  @media (min-width: 1200px) {
    .panel-home {
      width: 208px;
      height: 208px;
    }
  }
  .panel-background {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: 0.15s ease-in-out;
    background-size: cover;
    background-position: 50%;
  }
  .panel-info {
    position: absolute;
    padding: 5px;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, 0.75) 80%);
    backdrop-filter: blur(1px);
    margin: -1px;
    transition: 0.15s ease-in-out;
    overflow: hidden;
    text-align: center;
    text-shadow: 0 0 3px #000;
  }
  .panel-info > span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: white;
    padding: 0 10px;
  }
`;
