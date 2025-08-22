import { DailyReport, SectorRecap, APACComments } from '../types';

// Sample APAC comments with simplified structure
export const sampleAPACComments: APACComments = {
  pnl: 145000,
  risk: 82000,
  volumes: 268000,
  marketCommentary: 'Copr ID unch to 2bps tighter. HY unch to 0.25pt higher. CDS -0.25 to 0.25',
  date: new Date().toISOString().split('T')[0]
};

// Sample sector recaps based on the provided example
export const sampleSectorRecaps: SectorRecap[] = [
  {
    sector: 'Australia IG',
    marketMovesAndFlows: 'Kept constructive sentiment post the headline about Japan tariff to 15% and Ishiba stepping down.',
    metrics: {
      pnl: 200000,
      risk: 45000,
      volumes: 85000
    },
    marketCommentary: 'Spreads are broadly unchanged to 2 tighter with light flows, in Fin senior desk saw continued strong demand in MQGAU 33s and 34s, in T2s desk saw demand in ANZ 5.731 34s and ANZ/ WSTP 35/ 36s. In corporates desk continued to see interest in STOAU 31/ 33s and NBN curve.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader A'
  },
  {
    sector: 'Japan IG',
    marketMovesAndFlows: 'Kept constructive sentiment post the headline about Japan tariff to 15% and Ishiba stepping down.',
    metrics: {
      pnl: 200000,
      risk: 38000,
      volumes: 72000
    },
    marketCommentary: 'Japan IG cash spreads continued to be in a constructive tone after Japan holiday with IG (-1/-2), HY (+0.05/+0.15). SoftBank said it and Open Al\'s 500bn Al project struggled to get off ground. Recently issued cash bonds settled the day up in a better sentiment with spreads average (-1.5), HY average (+0.10). Desk continued to see demand in new SoftBank in the long durations. Japan CDS spreads settled the day in a similar tone. CDSI closed at 60(-1/2) with seeing protection sellers with the roll at 6.625(uc) with JGB10YR (-2), TPX (+1), USDJPY at 148(-3/4) post Japan upper house election.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader B'
  },
  {
    sector: 'China IG',
    marketMovesAndFlows: 'NA',
    metrics: {
      pnl: -30000,
      risk: 52000,
      volumes: 95000
    },
    marketCommentary: 'A bit of pullback today, closing +3/-1. TW names gave back 3bps on the recent gain, but had RMs adding after the move. TMT side, Syr closed unchanged to 1bp wider, 30yr is still solid though less buying interest today, closed broadly unchanged. HK names were active today. Seeing buyers across perps/bullets on NANFUN/HYSAN. HYSAN 7.2% up 75c with both retail and RMs buying. T2 are broadly unchanged.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader C'
  },
  {
    sector: 'SEA IG',
    marketMovesAndFlows: 'NA',
    metrics: {
      pnl: 170000,
      risk: 42000,
      volumes: 68000
    },
    marketCommentary: 'The rally in US rates brought profit takers of IG spreads, with PETMK the most actively sold (by US RM then Asia). TOPTB also saw sellers appear while the rest was more two-way.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader D'
  },
  {
    sector: 'India IG',
    marketMovesAndFlows: 'NA',
    metrics: {
      pnl: 200000,
      risk: 35000,
      volumes: 58000
    },
    marketCommentary: 'Spreads are 1-2 bps tighter but saw profit booking by clients today, desk saw flows across EXIMBK 26/ OILIN, INCIN, POWFIN 27s /TATSON 28s / RECLIN 29s and light two way flows in 10 year while RILIN 52/ 62s were better bid. ATs were 15 cents higher with better demand across both names.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader E'
  },
  {
    sector: 'Sovs',
    marketMovesAndFlows: 'NA',
    metrics: {
      pnl: 180000,
      risk: 28000,
      volumes: 45000
    },
    marketCommentary: 'Two way flows with ETF\'s and Asia RM the most active while international investors shun the tight valuations.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader F'
  }
];

// Generate historical mock data for the past 30 days
export const generateHistoricalData = (): DailyReport[] => {
  const reports: DailyReport[] = [];
  const today = new Date();

  // Sample market summaries for variety with distinct differences
  const marketSummaries = [
    'APAC markets showed strong resilience with credit spreads tightening 2-3bps across the board. Heavy buying interest in financials.',
    'Volatile session with Japan underperforming on policy uncertainty. Risk-off sentiment dominated with spreads 1-2bps wider.',
    'Constructive tone in most sectors with continued demand for quality names. Australia IG outperformed with 3bps tightening.',
    'Cautious trading environment focused on duration risk. Light flows but two-way interest in China IG names.',
    'Strong performance in financials offset TMT weakness. India IG saw heavy selling pressure with spreads 4bps wider.',
    'Risk-on sentiment returned with spreads tightening across all sectors. Strong demand for new issue paper.',
    'Mixed session with Japan IG leading gains while SEA lagged. Currency volatility impacted local bond performance.',
    'Defensive positioning ahead of central bank meetings. Flows concentrated in shorter duration paper.',
    'Rally continued with credit spreads at monthly tights. Strong institutional demand across all sectors.',
    'Profit-taking emerged after recent rally. Spreads 1-2bps wider but underlying tone remains constructive.'
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Skip weekends for trading data
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Create more distinct variations based on day index
    const dayVariation = i % 10; // Creates patterns every 10 days
    const isPositiveDay = dayVariation < 6; // 60% positive days
    const volatilityFactor = 1 + (dayVariation * 0.3); // Varying volatility

    const report: DailyReport = {
      date: dateString,
      apacComments: {
        pnl: Math.floor((isPositiveDay ? 1 : -1) * (100000 + dayVariation * 50000) * volatilityFactor),
        risk: Math.floor((50000 + dayVariation * 10000) * volatilityFactor),
        volumes: Math.floor((200000 + dayVariation * 30000) * volatilityFactor),
        marketCommentary: marketSummaries[dayVariation % marketSummaries.length],
        date: dateString
      },
      sectorRecaps: sampleSectorRecaps.map((recap, sectorIndex) => {
        const sectorMultiplier = isPositiveDay ? 1 : -1;
        const sectorVariation = (dayVariation + sectorIndex) % 5;

        return {
          ...recap,
          date: dateString,
          marketMovesAndFlows: `Day ${i + 1}: ${recap.sector} ${isPositiveDay ? 'outperformed' : 'underperformed'} with ${sectorVariation + 1}bps ${isPositiveDay ? 'tightening' : 'widening'}.`,
          marketCommentary: `${recap.sector} - ${isPositiveDay ? 'Constructive' : 'Cautious'} trading session. ${recap.marketCommentary.substring(0, 100)}... [Day ${i + 1} update]`,
          metrics: {
            pnl: Math.floor(sectorMultiplier * (50000 + sectorVariation * 30000) * volatilityFactor),
            risk: Math.floor((20000 + sectorVariation * 15000) * volatilityFactor),
            volumes: Math.floor((30000 + sectorVariation * 20000) * volatilityFactor)
          }
        };
      }),
      createdAt: date.toISOString(),
      lastModified: date.toISOString()
    };
    
    reports.push(report);
  }
  
  return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockHistoricalData = generateHistoricalData();
