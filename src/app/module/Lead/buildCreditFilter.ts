
export function buildCreditFilter(credits: string[]) {
  const conditions: Record<string, any>[] = [];

  credits.forEach((creditRange) => {
    const range = creditRange.toLowerCase().trim();

    if (range === 'free') {
      conditions.push({ credit: 0 });
    } else {
      const match = range.match(/(\d+)-(\d+)/);
      if (match) {
        const min = parseInt(match[1], 10);
        const max = parseInt(match[2], 10);
        conditions.push({ credit: { $gte: min, $lte: max } });
      }
    }
  });

  return conditions.length > 0 ? { $or: conditions } : {};
}
