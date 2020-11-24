const populate = (id: { [x: string]: any; mbid?: any; artist?: any; album?: any; }, config: any[]) => {
  return config.map((p: { provider: any; key: any; }) => {
    const { provider, key } = p;
    if (key) {
      return provider(id[key]);
    }
    return provider(id);
  });
};

export { populate };
