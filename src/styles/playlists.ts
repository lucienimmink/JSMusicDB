import { css } from 'lit';

export default css`
  .playlists .header {
    height: 60px;
    border-top: 1px solid transparent;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .container {
    flex-direction: column;
  }
  .playlists {
    width: 100%;
  }
  .playlist {
    width: 100%;
  }
  .playlists select {
    width: calc(100% - 2rem);
    box-sizing: border-box;
    margin: 1.85rem 1rem 0.5rem;
  }
  .playlists li {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    transition: background-color 0.2s ease-in-out;
    min-height: 59px;
    align-items: center;
    border-bottom: 1px solid var(--border-colour);
  }
  .playlists li app-link {
    display: flex;
    color: var(--primary, #00417a);
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    align-items: center;
    height: 59px;
    width: 100%;
    padding-left: 1rem;
  }
  .playlists li app-link:hover {
    background: var(--background2);
  }
  .playlists li .btn-refresh {
    opacity: 0;
    position: absolute;
    right: 10px;
    margin-top: -5px;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
  }
  .playlists li app-link:hover .btn-refresh {
    opacity: 1;
    pointer-events: all;
  }
  .playlists li app-link .icon-note svg {
    width: 16px;
    display: inline-block;
    margin-left: 16px;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  .playlists li.active app-link {
    background: var(--background2);
  }
  .playlists li.active app-link .icon-note svg {
    opacity: 1;
  }
  .playlist li {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    border-bottom: 1px solid var(--border-colour);
    padding: 0.5rem 1rem;
    background-color: var(--background);
    transition: background-color 0.2s ease-in-out;
    min-height: 60px;
    width: 100%;
  }
  .playlist li.header {
    display: block;
    padding: 1.85rem 1rem 0px;
    height: auto;
  }
  .playlist track-in-list {
    display: flex;
    min-height: 60px;
    width: 100%;
    cursor: pointer;
  }
  .playlist li.header:hover,
  .playlist li.no-hover:hover {
    backdrop-filter: blur(2px);
    background: var(--background-seethrough, rgba(248, 249, 250, 0.85));
  }
  .playlist .artist-selector {
    display: flex;
    align-items: center;
  }
  .playlist .artist-selector select {
    width: 100%;
  }
  loading-indicator {
    width: 180px;
    margin: 4rem auto 0;
  }
  select {
    background: var(--background2);
    padding: 0.3rem 0.5rem;
    color: var(--text-color);
  }
  select:focus {
    outline: 2px solid var(--primary);
  }
  @media (min-width: 768px) {
    .playlist .artist-selector select {
      margin-left: 1rem;
      max-width: 250px;
    }
    .container {
      flex-direction: row;
    }
    .playlists {
      width: 30%;
    }
    .playlists ul {
      position: sticky;
      top: 0;
    }
    .playlist {
      width: 70%;
    }
    loading-indicator {
      margin: calc(50vh - 106px) auto 0;
    }
  }
  @media (min-width: 992px) {
    .playlists ul {
      position: sticky;
      top: 100px;
    }
  }
`;
