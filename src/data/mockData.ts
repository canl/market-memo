import { DailyReport, SectorRecap, APACComments } from '../types';

// Sample APAC comments based on the provided example
export const sampleAPACComments: APACComments = {
  risk: '82k (-24k)',
  pnlCash: 175000,
  pnlCds: -30000,
  volumes: '268M',
  marketCommentary: 'Copr ID unch to 2bps tighter. HY unch to 0.25pt higher. CDS -0.25 to 0.25',
  date: new Date().toISOString().split('T')[0]
};

// Sample sector recaps based on the provided example
export const sampleSectorRecaps: SectorRecap[] = [
  {
    sector: 'Australia IG',
    marketMovesAndFlows: 'Kept constructive sentiment post the headline about Japan tariff to 15% and Ishiba stepping down.',
    dailyPnL: {
      usdBonds: 130000,
      jpyBonds: 40000,
      cds: 30000
    },
    marketCommentary: 'Spreads are broadly unchanged to 2 tighter with light flows, in Fin senior desk saw continued strong demand in MQGAU 33s and 34s, in T2s desk saw demand in ANZ 5.731 34s and ANZ/ WSTP 35/ 36s. In corporates desk continued to see interest in STOAU 31/ 33s and NBN curve.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader A'
  },
  {
    sector: 'Japan IG',
    marketMovesAndFlows: 'Kept constructive sentiment post the headline about Japan tariff to 15% and Ishiba stepping down.',
    dailyPnL: {
      usdBonds: 130000,
      jpyBonds: 40000,
      cds: 30000
    },
    marketCommentary: 'Japan IG cash spreads continued to be in a constructive tone after Japan holiday with IG (-1/-2), HY (+0.05/+0.15). SoftBank said it and Open Al\'s 500bn Al project struggled to get off ground. Recently issued cash bonds settled the day up in a better sentiment with spreads average (-1.5), HY average (+0.10). Desk continued to see demand in new SoftBank in the long durations. Japan CDS spreads settled the day in a similar tone. CDSI closed at 60(-1/2) with seeing protection sellers with the roll at 6.625(uc) with JGB10YR (-2), TPX (+1), USDJPY at 148(-3/4) post Japan upper house election.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader B'
  },
  {
    sector: 'China IG',
    marketMovesAndFlows: 'NA',
    dailyPnL: {
      usdBonds: -100000,
      cnyBonds: 40000,
      cds: 30000
    },
    marketCommentary: 'A bit of pullback today, closing +3/-1. TW names gave back 3bps on the recent gain, but had RMs adding after the move. TMT side, Syr closed unchanged to 1bp wider, 30yr is still solid though less buying interest today, closed broadly unchanged. HK names were active today. Seeing buyers across perps/bullets on NANFUN/HYSAN. HYSAN 7.2% up 75c with both retail and RMs buying. T2 are broadly unchanged.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader C'
  },
  {
    sector: 'SEA IG',
    marketMovesAndFlows: 'NA',
    dailyPnL: {
      usdBonds: 100000,
      myrBonds: 40000,
      cds: 30000
    },
    marketCommentary: 'The rally in US rates brought profit takers of IG spreads, with PETMK the most actively sold (by US RM then Asia). TOPTB also saw sellers appear while the rest was more two-way.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader D'
  },
  {
    sector: 'India IG',
    marketMovesAndFlows: 'NA',
    dailyPnL: {
      usdBonds: 130000,
      inrBonds: 40000,
      cds: 30000
    },
    marketCommentary: 'Spreads are 1-2 bps tighter but saw profit booking by clients today, desk saw flows across EXIMBK 26/ OILIN, INCIN, POWFIN 27s /TATSON 28s / RECLIN 29s and light two way flows in 10 year while RILIN 52/ 62s were better bid. ATs were 15 cents higher with better demand across both names.',
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Trader E'
  },
  {
    sector: 'Sovs',
    marketMovesAndFlows: 'NA',
    dailyPnL: {
      usdBonds: 150000,
      cds: 30000
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

  // Sample market summaries for variety
  const marketSummaries = [
    'APAC markets showed resilience despite global headwinds. Credit spreads remained stable with selective buying interest.',
    'Mixed performance across APAC with Japan outperforming on policy expectations. Volatility remains elevated.',
    'Constructive tone in most sectors with continued demand for quality names. Risk sentiment improving gradually.',
    'Cautious trading environment with focus on duration risk. Flows were light but two-way across most sectors.',
    'Strong performance in financials offset weakness in TMT. Overall P&L positive despite challenging conditions.'
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Skip weekends for trading data
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const report: DailyReport = {
      date: dateString,
      apacComments: {
        risk: `${Math.floor(Math.random() * 100)}k (${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 50)}k)`,
        pnlCash: Math.floor((Math.random() - 0.5) * 2000000),
        pnlCds: Math.floor((Math.random() - 0.5) * 200000),
        volumes: `${Math.floor(Math.random() * 500)}M`,
        marketCommentary: marketSummaries[Math.floor(Math.random() * marketSummaries.length)],
        date: dateString
      },
      sectorRecaps: sampleSectorRecaps.map(recap => ({
        ...recap,
        date: dateString,
        dailyPnL: {
          ...recap.dailyPnL,
          usdBonds: Math.floor((Math.random() - 0.5) * 400000),
          localBonds: Math.floor((Math.random() - 0.5) * 100000),
          jpyBonds: Math.floor((Math.random() - 0.5) * 100000),
          cnyBonds: Math.floor((Math.random() - 0.5) * 100000),
          myrBonds: Math.floor((Math.random() - 0.5) * 100000),
          inrBonds: Math.floor((Math.random() - 0.5) * 100000),
          cds: Math.floor((Math.random() - 0.5) * 80000)
        }
      })),
      createdAt: date.toISOString(),
      lastModified: date.toISOString()
    };
    
    reports.push(report);
  }
  
  return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockHistoricalData = generateHistoricalData();
