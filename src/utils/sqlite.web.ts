export const openDatabase = () => {
  console.warn("SQLite is not supported on Web. Using fallback DB.");
  return {
    transaction: (cb: any) => cb({
      executeSql: (_sql: any, _params: any, success: any) => success(null, []),
    }),
  };
};
