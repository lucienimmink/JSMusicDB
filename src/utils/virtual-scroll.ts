export const handleScroll = (scroller: any, index = 0) => {
  const offsetted = index === 0 ? 0 : index - 1;
  scroller?.scrollToIndex(offsetted, 'start');
  setTimeout(() => {
    if (offsetted !== 0) {
      scroller?.scrollToIndex(offsetted, 'start');
    } else {
      document.querySelector('html')?.scrollTo({ top: 0 });
    }
  }, 10);
};
