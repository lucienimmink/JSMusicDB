import { global as EventBus } from './EventBus';
import { NEXT_TRACK, PREVIOUS_TRACK, TOGGLE_PLAY_PAUSE_PLAYER } from './player';

export const launchQueue = () => {
  if (
    'launchQueue' in window &&
    // @ts-ignore
    'targetURL' in window.LaunchParams.prototype
  ) {
    // @ts-ignore
    window.launchQueue.setConsumer(launchParams => {
      if (launchParams.targetURL) {
        const query = new URL(launchParams.targetURL).searchParams;
        const nav = query.get('nav');
        switch (nav) {
          case 'next':
            EventBus.emit(NEXT_TRACK, {});
            break;
          case 'prev':
            EventBus.emit(PREVIOUS_TRACK, {});
            break;
          case 'playpause':
            EventBus.emit(TOGGLE_PLAY_PAUSE_PLAYER, {});
            break;
          default:
            console.log(`unknown shortcut event: ${nav}`);
        }
      }
    });
  } else {
    console.log('not supported');
  }
};
