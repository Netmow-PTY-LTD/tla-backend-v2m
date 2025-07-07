
export const startQueryTimer = () => {
  const start = process.hrtime();
  const startTime = new Date().toISOString();

  return {
    start,
    startTime,
    endQueryTimer: () => {
      const diff = process.hrtime(start);
      const durationInMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
      const durationInSeconds = (Number(durationInMs) / 1000).toFixed(2);
      const endTime = new Date().toISOString();

      return {
        start_time: startTime,
        end_time: endTime,
        durationInMs,
        durationInSeconds,
      };
    },
  };
};
