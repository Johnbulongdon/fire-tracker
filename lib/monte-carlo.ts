export type MonteCarloResult = {
  probability: number;
  p10Years: number;
  p50Years: number;
  p90Years: number;
  histogram: { bucket: string; count: number; within40: boolean }[];
  totalRuns: number;
};

export function monteCarloFIRE({
  initialInvestable,
  annualSavings,
  fireTarget,
  meanReturn = 0.07,
  runs = 1000,
  maxYears = 50,
}: {
  initialInvestable: number;
  annualSavings: number;
  fireTarget: number;
  meanReturn?: number;
  runs?: number;
  maxYears?: number;
}): MonteCarloResult {
  const stddev = 0.12;
  const fireYears: number[] = [];

  for (let r = 0; r < runs; r++) {
    let portfolio = initialInvestable;
    let hitYear = maxYears + 1;

    for (let y = 1; y <= maxYears; y++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random() || 1e-10;
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const returnRate = meanReturn + stddev * z;
      portfolio = portfolio * (1 + returnRate) + annualSavings;

      if (portfolio >= fireTarget) {
        hitYear = y;
        break;
      }
    }
    fireYears.push(hitYear);
  }

  fireYears.sort((a, b) => a - b);

  const within40 = fireYears.filter(y => y <= 40).length;
  const probability = Math.round((within40 / runs) * 100);

  const p10Years = fireYears[Math.floor(runs * 0.1)];
  const p50Years = fireYears[Math.floor(runs * 0.5)];
  const p90Years = fireYears[Math.floor(runs * 0.9)];

  const BUCKETS: { label: string; min: number; max: number; within40: boolean }[] = [
    { label: "0–5",   min: 0,  max: 5,        within40: true  },
    { label: "6–10",  min: 6,  max: 10,       within40: true  },
    { label: "11–15", min: 11, max: 15,       within40: true  },
    { label: "16–20", min: 16, max: 20,       within40: true  },
    { label: "21–25", min: 21, max: 25,       within40: true  },
    { label: "26–30", min: 26, max: 30,       within40: true  },
    { label: "31–35", min: 31, max: 35,       within40: true  },
    { label: "36–40", min: 36, max: 40,       within40: true  },
    { label: "40+",   min: 41, max: Infinity, within40: false },
  ];

  const histogram = BUCKETS.map(b => ({
    bucket: b.label,
    count: fireYears.filter(y => y >= b.min && y <= b.max).length,
    within40: b.within40,
  }));

  return { probability, p10Years, p50Years, p90Years, histogram, totalRuns: runs };
}
