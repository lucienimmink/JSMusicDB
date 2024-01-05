export const handleScroll = (scroller: any, index = 0) => {
  const offsetted = index === 0 ? 0 : index - 1;
  scroller?.element(offsetted).scrollIntoView({ block: 'start' });
  if (offsetted === 0) {
    document.querySelector('html')?.scrollTo({ top: 0 });
  }
};
