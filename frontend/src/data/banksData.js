// ============================================================================
// FINTWIN MULTI-BANK & WEALTH INTELLIGENCE DATA REPOSITORY
// Scalable, multi-tiered Indian banking ecosystem across 5 regulatory categories
// ============================================================================

export const BANK_CATEGORIES = [
  "Public Sector Banks",
  "Private Sector Banks",
  "Small Finance Banks",
  "Regional Rural Banks",
  "Cooperative Banks"
];

export const LOAN_CATEGORIES = [
  "Housing Loans",
  "Personal Loans",
  "Vehicle Loans",
  "Education Loans",
  "Gold Loans",
  "Business & MSME Loans",
  "Loan Against Property (LAP)",
  "Agriculture & Rural Loans"
];

export const LOAN_TENURE_OPTIONS = {
  "Housing Loans": [
    { label: "Home Loan (30y)", years: 30 },
    { label: "Home Loan (25y)", years: 25 },
    { label: "Home Loan (20y)", years: 20 },
    { label: "Home Loan (15y)", years: 15 },
    { label: "Home Loan (10y)", years: 10 }
  ],
  "Personal Loans": [
    { label: "Personal Loan (5y)", years: 5 },
    { label: "Personal Loan (4y)", years: 4 },
    { label: "Personal Loan (3y)", years: 3 },
    { label: "Personal Loan (2y)", years: 2 },
    { label: "Personal Loan (1y)", years: 1 }
  ],
  "Vehicle Loans": [
    { label: "Vehicle Loan (7y)", years: 7 },
    { label: "Vehicle Loan (5y)", years: 5 },
    { label: "Vehicle Loan (3y)", years: 3 }
  ],
  "Education Loans": [
    { label: "Education Loan (15y)", years: 15 },
    { label: "Education Loan (10y)", years: 10 },
    { label: "Education Loan (7y)", years: 7 },
    { label: "Education Loan (5y)", years: 5 }
  ],
  "Gold Loans": [
    { label: "Gold Loan (3y)", years: 3 },
    { label: "Gold Loan (2y)", years: 2 },
    { label: "Gold Loan (1y)", years: 1 }
  ],
  "Business & MSME Loans": [
    { label: "Business Loan (7y)", years: 7 },
    { label: "Business Loan (5y)", years: 5 },
    { label: "Business Loan (3y)", years: 3 }
  ],
  "Loan Against Property (LAP)": [
    { label: "Property Loan (15y)", years: 15 },
    { label: "Property Loan (10y)", years: 10 },
    { label: "Property Loan (5y)", years: 5 }
  ],
  "Agriculture & Rural Loans": [
    { label: "Agri Term Loan (7y)", years: 7 },
    { label: "Agri Term Loan (5y)", years: 5 },
    { label: "Kisan Credit Facility (1y)", years: 1 }
  ]
};

export const DEFAULT_PRINCIPALS = {
  "Housing Loans": 2500000,
  "Personal Loans": 500000,
  "Vehicle Loans": 800000,
  "Education Loans": 1500000,
  "Gold Loans": 300000,
  "Business & MSME Loans": 2000000,
  "Loan Against Property (LAP)": 3500000,
  "Agriculture & Rural Loans": 400000
};

// ============================================================================
// COMPREHENSIVE MULTI-BANK CATALOG
// ============================================================================
export const BANKS_DATA = {
  "Public Sector Banks": [
    {
      id: "SBI",
      name: "State Bank of India (SBI)",
      shortName: "SBI",
      rating: "4.8",
      url: "https://sbi.co.in",
      logoColor: "#1d4ed8",
      loans: {
        "Housing Loans": [
          { id: "sbi_reg_home", name: "SBI Regular Home Loan", rate: 8.50, rating: "4.8", features: "Lowest rate, zero processing fee offers, women concession" },
          { id: "sbi_priv_home", name: "SBI Priviledge Home Loan", rate: 8.40, rating: "4.7", features: "Exclusively for Central/State Govt employees" },
          { id: "sbi_shaurya_home", name: "SBI Shaurya Home Loan", rate: 8.40, rating: "4.9", features: "Special scheme for Armed Forces & Defence Personnel" },
          { id: "sbi_maxgain_home", name: "SBI Maxgain Home Loan (OD)", rate: 8.75, rating: "4.7", features: "Smart overdraft variant to save interest using surplus savings" },
          { id: "sbi_realty_home", name: "SBI Realty Plot Loan", rate: 8.85, rating: "4.5", features: "Finance for purchasing residential plot for future construction" },
          { id: "sbi_tribal_home", name: "SBI Tribal Plus Housing", rate: 8.60, rating: "4.4", features: "Tailored housing loans for hilly and tribal areas" }
        ],
        "Personal Loans": [
          { id: "sbi_xpress_credit", name: "SBI Xpress Credit Personal Loan", rate: 10.30, rating: "4.7", features: "Instant sanction for salaried employees with salary account" },
          { id: "sbi_quick_pl", name: "SBI Quick Personal Loan", rate: 10.90, rating: "4.5", features: "Minimal documentation, rapid digital disbursal" },
          { id: "sbi_pension_loan", name: "SBI Pension Loan", rate: 9.75, rating: "4.6", features: "Low rate for Central, State and Defence pensioners" }
        ],
        "Vehicle Loans": [
          { id: "sbi_car_loan", name: "SBI Regular Car Loan", rate: 8.75, rating: "4.8", features: "Up to 90% on-road funding, zero prepayment penalty" },
          { id: "sbi_green_car", name: "SBI Green Car Loan (EV)", rate: 8.55, rating: "4.9", features: "20 bps discount for Electric Vehicles" }
        ],
        "Education Loans": [
          { id: "sbi_student_loan", name: "SBI Student Loan Scheme", rate: 8.65, rating: "4.7", features: "Covering tuition & living costs in India up to ₹50 Lakhs" },
          { id: "sbi_scholar_loan", name: "SBI Scholar Loan (Premier Institutes)", rate: 8.15, rating: "4.9", features: "100% financing for IITs, IIMs, NITs with zero collateral" },
          { id: "sbi_edvantage", name: "SBI Global Ed-Vantage (Abroad)", rate: 8.90, rating: "4.8", features: "Up to ₹1.5 Cr for recognized global universities" }
        ],
        "Gold Loans": [
          { id: "sbi_personal_gold", name: "SBI Personal Gold Loan", rate: 8.70, rating: "4.6", features: "Up to ₹50 Lakhs against gold ornaments, flexible repayment" }
        ],
        "Business & MSME Loans": [
          { id: "sbi_sme_smart", name: "SBI SME Smart Score", rate: 9.25, rating: "4.6", features: "Structured working capital for MSME enterprises" },
          { id: "sbi_mudra", name: "SBI Pradhan Mantri Mudra Scheme", rate: 8.95, rating: "4.7", features: "Collateral-free micro loans up to ₹10 Lakhs" }
        ],
        "Loan Against Property (LAP)": [
          { id: "sbi_plap", name: "SBI Loan Against Property (P-LAP)", rate: 9.15, rating: "4.5", features: "Leverage residential/commercial property for high-ticket capital" }
        ],
        "Agriculture & Rural Loans": [
          { id: "sbi_kcc", name: "SBI Kisan Credit Card (KCC)", rate: 7.00, rating: "4.8", features: "Interest subvention available; vital seasonal crop funding" }
        ]
      },
      investments: [
        { name: "SBI Amrit Kalash FD (400 Days)", return: "7.10%", lockIn: "400 Days", risk: "Low (DICGC Backed)", tax: "Regular Bank FD Rates", bestFitRisk: "Low" },
        { name: "SBI Green Rupee Term Deposit", return: "6.85%", lockIn: "1111 Days", risk: "Low", tax: "Funds ESG & Green Infrastructure", bestFitRisk: "Low" },
        { name: "SBI Bluechip Mutual Fund SIP", return: "14.2%", lockIn: "None (Open)", risk: "Medium", tax: "Long-term Capital Gains", bestFitRisk: "Medium" },
        { name: "SBI Long Term Equity ELSS", return: "13.8%", lockIn: "3y", risk: "Medium-High", tax: "Section 80C Tax Saver", bestFitRisk: "Medium" }
      ]
    },
    {
      id: "BOB",
      name: "Bank of Baroda",
      shortName: "Bank of Baroda",
      rating: "4.6",
      url: "https://bankofbaroda.in",
      logoColor: "#ea580c",
      loans: {
        "Housing Loans": [
          { id: "bob_home", name: "Baroda Home Loan", rate: 8.40, rating: "4.7", features: "Industry-leading baseline rates linked to Baroda repo benchmark" },
          { id: "bob_advantage", name: "Baroda Home Loan Advantage (OD)", rate: 8.65, rating: "4.6", features: "Overdraft linked account to park daily operational funds" },
          { id: "bob_topup", name: "Baroda Home Improvement & Top-Up", rate: 8.75, rating: "4.5", features: "Top-up credit for extension and furnishing" },
          { id: "bob_ashray", name: "Baroda Ashray Housing for Seniors", rate: 8.45, rating: "4.6", features: "Tailored reverse mortgage and housing credit for seniors" }
        ],
        "Personal Loans": [
          { id: "bob_personal", name: "Baroda Digital Personal Loan", rate: 10.40, rating: "4.5", features: "Zero manual intervention, instant paperless credit" },
          { id: "bob_yoddha", name: "Baroda Yoddha for Defence", rate: 9.90, rating: "4.8", features: "Preferential terms for active service and veterans" }
        ],
        "Vehicle Loans": [
          { id: "bob_car", name: "Baroda Auto Loan", rate: 8.70, rating: "4.6", features: "Finance up to 90% on-road cost for new vehicles" }
        ],
        "Education Loans": [
          { id: "bob_scholar", name: "Baroda Scholar (Abroad Studies)", rate: 8.85, rating: "4.8", features: "Up to ₹1.5 Cr for premier global universities" },
          { id: "bob_vidya", name: "Baroda Vidya (Domestic Education)", rate: 8.50, rating: "4.6", features: "Comprehensive fee coverage for Indian universities" }
        ],
        "Gold Loans": [
          { id: "bob_gold", name: "Baroda Gold Loan Express", rate: 8.60, rating: "4.7", features: "Prompt evaluation, tenure up to 3 years" }
        ],
        "Business & MSME Loans": [
          { id: "bob_msme", name: "Baroda MSME General Loan", rate: 9.10, rating: "4.5", features: "Capex and working capital funding for enterprises" }
        ],
        "Loan Against Property (LAP)": [
          { id: "bob_lap", name: "Baroda Mortgage Loan", rate: 9.15, rating: "4.4", features: "High quantum secured against commercial or residential property" }
        ],
        "Agriculture & Rural Loans": [
          { id: "bob_kisan", name: "Baroda Kisan Credit Card", rate: 7.00, rating: "4.7", features: "Concessional agri financing with prompt crop loan release" }
        ]
      },
      investments: [
        { name: "Baroda Monsoon Dhamaka FD (399D)", return: "7.15%", lockIn: "399 Days", risk: "Low", tax: "Standard FD Slabs", bestFitRisk: "Low" },
        { name: "Baroda Tiranga Plus Deposit (399D)", return: "7.05%", lockIn: "399 Days", risk: "Low", tax: "Fixed Maturity Return", bestFitRisk: "Low" },
        { name: "Baroda BNP Paribas Large Cap Fund", return: "13.6%", lockIn: "None", risk: "Medium", tax: "LTCG Equity", bestFitRisk: "Medium" }
      ]
    },
    {
      id: "PNB",
      name: "Punjab National Bank (PNB)",
      shortName: "PNB",
      rating: "4.5",
      url: "https://pnbindia.in",
      logoColor: "#b91c1c",
      loans: {
        "Housing Loans": [
          { id: "pnb_max_saver", name: "PNB Max-Saver Housing Loan", rate: 8.45, rating: "4.6", features: "Liquid overdraft home loan with high flexibility" },
          { id: "pnb_pride", name: "PNB Pride Housing for Govt", rate: 8.40, rating: "4.7", features: "Dedicated subsidized rates for central/state staff" },
          { id: "pnb_gen_next", name: "PNB Gen-Next Housing for Youth", rate: 8.50, rating: "4.5", features: "Higher eligibility with staggered EMIs for young professionals" }
        ],
        "Personal Loans": [
          { id: "pnb_sahayog", name: "PNB Sahayog Personal Loan", rate: 10.50, rating: "4.4", features: "Clean personal overdraft and term loan" },
          { id: "pnb_pensioner", name: "PNB Pensioner Scheme", rate: 9.80, rating: "4.6", features: "Immediate liquidity support for senior pensioners" }
        ],
        "Vehicle Loans": [
          { id: "pnb_saarthi", name: "PNB Saarthi Car Loan", rate: 8.75, rating: "4.5", features: "Financing for private and electric vehicles" }
        ],
        "Education Loans": [
          { id: "pnb_saraswati", name: "PNB Saraswati Education Loan", rate: 8.55, rating: "4.6", features: "Higher studies in recognized Indian institutions" },
          { id: "pnb_udaan", name: "PNB Udaan (Overseas Studies)", rate: 8.90, rating: "4.7", features: "Full tuition and living cost support abroad" }
        ],
        "Gold Loans": [
          { id: "pnb_gold", name: "PNB Gold Loan Scheme", rate: 8.65, rating: "4.5", features: "Quick disbursement against 22K gold ornaments" }
        ],
        "Business & MSME Loans": [
          { id: "pnb_sanjeevani", name: "PNB Sanjeevani MSME Scheme", rate: 9.30, rating: "4.5", features: "Tailored for small units and manufacturing hubs" }
        ],
        "Loan Against Property (LAP)": [
          { id: "pnb_lap", name: "PNB Loan Against Property", rate: 9.20, rating: "4.4", features: "Secured credit for expanding family enterprise or education" }
        ],
        "Agriculture & Rural Loans": [
          { id: "pnb_krishi", name: "PNB Krishi Card Yojana", rate: 7.00, rating: "4.7", features: "Comprehensive farm inputs and tractor support" }
        ]
      },
      investments: [
        { name: "PNB Uttam Non-Callable FD (444D)", return: "7.25%", lockIn: "444 Days", risk: "Low", tax: "Standard Tax Slabs", bestFitRisk: "Low" },
        { name: "PNB Sugam Term Deposit", return: "6.80%", lockIn: "1-3 Years", risk: "Low", tax: "Premature Partial Withdrawal", bestFitRisk: "Low" }
      ]
    },
    {
      id: "CANARA",
      name: "Canara Bank",
      shortName: "Canara Bank",
      rating: "4.5",
      url: "https://canarabank.com",
      logoColor: "#0284c7",
      loans: {
        "Housing Loans": [
          { id: "canara_home", name: "Canara Home Loan", rate: 8.40, rating: "4.6", features: "Affordable interest rates with simple eligibility guidelines" },
          { id: "canara_site", name: "Canara Site Loan", rate: 8.95, rating: "4.4", features: "For buying approved residential plots" },
          { id: "canara_home_choice", name: "Canara Home Choice OD", rate: 8.70, rating: "4.5", features: "Overdraft linked home credit" }
        ],
        "Personal Loans": [
          { id: "canara_budget", name: "Canara Budget Personal Loan", rate: 10.65, rating: "4.4", features: "For genuine personal and medical contingencies" }
        ],
        "Vehicle Loans": [
          { id: "canara_vehicle", name: "Canara Vehicle Loan", rate: 8.70, rating: "4.6", features: "New and pre-owned vehicle coverage" }
        ],
        "Education Loans": [
          { id: "canara_vidya_turan", name: "Canara Vidya Turan", rate: 8.60, rating: "4.7", features: "Express educational loan for top Indian B-schools" }
        ],
        "Gold Loans": [
          { id: "canara_swarna", name: "Canara Swarna Gold Loan", rate: 8.55, rating: "4.7", features: "Lowest interest gold loan across public sector" }
        ],
        "Business & MSME Loans": [
          { id: "canara_msme", name: "Canara MSME Smart Loan", rate: 9.20, rating: "4.5", features: "Flexible collateral options for business scaling" }
        ],
        "Loan Against Property (LAP)": [
          { id: "canara_lap", name: "Canara Mortgage Facility", rate: 9.10, rating: "4.4", features: "Long tenure property mortgage" }
        ],
        "Agriculture & Rural Loans": [
          { id: "canara_kcc", name: "Canara Kisan Credit Card", rate: 7.00, rating: "4.8", features: "Direct farmer support with interest subvention" }
        ]
      },
      investments: [
        { name: "Canara Special Term Deposit (444D)", return: "7.25%", lockIn: "444 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" },
        { name: "Canara Robeco Emerging Equities SIP", return: "14.8%", lockIn: "None", risk: "High", tax: "LTCG Equity", bestFitRisk: "High" }
      ]
    },
    {
      id: "UNION",
      name: "Union Bank of India",
      shortName: "Union Bank",
      rating: "4.5",
      url: "https://unionbankofindia.co.in",
      logoColor: "#059669",
      loans: {
        "Housing Loans": [
          { id: "union_awas", name: "Union Awas Home Loan", rate: 8.35, rating: "4.7", features: "One of the most competitive baseline home rates in India" },
          { id: "union_ashiyana", name: "Union Ashiyana Scheme", rate: 8.40, rating: "4.6", features: "Comprehensive financing for flat or bungalow construction" }
        ],
        "Personal Loans": [
          { id: "union_personal", name: "Union Personal Loan", rate: 10.45, rating: "4.5", features: "Hassle-free unsecured credit for salaried professionals" }
        ],
        "Vehicle Loans": [
          { id: "union_miles", name: "Union Miles Auto Loan", rate: 8.75, rating: "4.5", features: "High loan-to-value ratio for vehicle purchase" }
        ],
        "Education Loans": [
          { id: "union_education", name: "Union Education Loan", rate: 8.60, rating: "4.6", features: "Zero processing fees for top tier Indian institutions" }
        ],
        "Gold Loans": [
          { id: "union_gold", name: "Union Gold Loan", rate: 8.65, rating: "4.6", features: "Instant appraisal and disbursal" }
        ],
        "Business & MSME Loans": [
          { id: "union_msme", name: "Union MSME Pragati", rate: 9.15, rating: "4.5", features: "Term loan and cash credit for small enterprises" }
        ],
        "Loan Against Property (LAP)": [
          { id: "union_lap", name: "Union Property Loan", rate: 9.10, rating: "4.4", features: "Multi-purpose loan backed by property collateral" }
        ],
        "Agriculture & Rural Loans": [
          { id: "union_kcc", name: "Union Green Card (KCC)", rate: 7.00, rating: "4.7", features: "Flexible agricultural credit line" }
        ]
      },
      investments: [
        { name: "Union Samriddhi Deposit (399D)", return: "7.15%", lockIn: "399 Days", risk: "Low", tax: "Standard Tax Slabs", bestFitRisk: "Low" }
      ]
    },
    {
      id: "BOI",
      name: "Bank of India",
      shortName: "Bank of India",
      rating: "4.4",
      url: "https://bankofindia.co.in",
      logoColor: "#c2410c",
      loans: {
        "Housing Loans": [
          { id: "boi_star_home", name: "BOI Star Home Loan", rate: 8.40, rating: "4.6", features: "Attractive interest concessions for CIBIL > 760" },
          { id: "boi_topup", name: "BOI Star Top-Up Housing", rate: 8.70, rating: "4.4", features: "Additional funding on existing housing loan" }
        ],
        "Personal Loans": [
          { id: "boi_star_personal", name: "BOI Star Personal Loan", rate: 10.60, rating: "4.4", features: "Clean funding with no hidden maintenance fees" }
        ],
        "Vehicle Loans": [
          { id: "boi_star_vehicle", name: "BOI Star Vehicle Loan", rate: 8.75, rating: "4.5", features: "Up to 85% on-road funding" }
        ],
        "Education Loans": [
          { id: "boi_star_vidya", name: "BOI Star Vidya Loan", rate: 8.55, rating: "4.6", features: "Comprehensive support for higher degrees" }
        ],
        "Gold Loans": [
          { id: "boi_star_gold", name: "BOI Star Gold Loan", rate: 8.65, rating: "4.5", features: "Emergency liquidity backed by gold" }
        ],
        "Business & MSME Loans": [
          { id: "boi_msme", name: "BOI Star MSME Scheme", rate: 9.20, rating: "4.4", features: "Credit guarantee linked business financing" }
        ],
        "Loan Against Property (LAP)": [
          { id: "boi_lap", name: "BOI Star Mortgage Loan", rate: 9.15, rating: "4.3", features: "Secured credit against residential or industrial property" }
        ],
        "Agriculture & Rural Loans": [
          { id: "boi_kisan", name: "BOI Kisan Samriddhi Card", rate: 7.00, rating: "4.7", features: "Crop and agri infrastructure support" }
        ]
      },
      investments: [
        { name: "BOI Shubh Arambh FD (501D)", return: "7.20%", lockIn: "501 Days", risk: "Low", tax: "Standard Tax Slabs", bestFitRisk: "Low" }
      ]
    }
  ],

  "Private Sector Banks": [
    {
      id: "HDFC",
      name: "HDFC Bank",
      shortName: "HDFC Bank",
      rating: "4.8",
      url: "https://hdfcbank.com",
      logoColor: "#1e3a8a",
      loans: {
        "Housing Loans": [
          { id: "hdfc_std_home", name: "HDFC Standard Home Loan", rate: 8.70, rating: "4.8", features: "India's leading private housing loan provider; seamless digital sanction" },
          { id: "hdfc_reach_home", name: "HDFC Reach Home Loan", rate: 9.15, rating: "4.6", features: "Designed for micro-entrepreneurs & individuals with informal income" },
          { id: "hdfc_extension", name: "HDFC Home Extension & Improvement", rate: 8.75, rating: "4.7", features: "Customized for expanding or upgrading existing living space" },
          { id: "hdfc_plot", name: "HDFC Plot & Composite Housing", rate: 8.85, rating: "4.5", features: "Dual loan to buy land and construct dwelling" },
          { id: "hdfc_topup", name: "HDFC Top-Up Home Loan", rate: 8.90, rating: "4.7", features: "Instant top-up facility on existing mortgage" }
        ],
        "Personal Loans": [
          { id: "hdfc_insta_pl", name: "HDFC Instant Personal Loan", rate: 10.50, rating: "4.8", features: "10-second disbursement for pre-approved customers" },
          { id: "hdfc_golden_edge", name: "HDFC Golden Edge Premium PL", rate: 10.25, rating: "4.9", features: "Subsidized pricing for corporate salary account holders" }
        ],
        "Vehicle Loans": [
          { id: "hdfc_custom_car", name: "HDFC Custom Car Loan", rate: 8.80, rating: "4.7", features: "Up to 100% on-road funding for selected models" },
          { id: "hdfc_zipdrive", name: "HDFC ZipDrive Express Auto", rate: 8.65, rating: "4.9", features: "Instant paperless car financing" }
        ],
        "Education Loans": [
          { id: "hdfc_credila", name: "HDFC Credila Overseas Education", rate: 9.25, rating: "4.8", features: "Dedicated education NBFC; covers tuition, flight & living costs" }
        ],
        "Gold Loans": [
          { id: "hdfc_sampoorna_gold", name: "HDFC Sampoorna Gold Loan", rate: 8.80, rating: "4.6", features: "Competitive valuation, repayment terms up to 2 years" }
        ],
        "Business & MSME Loans": [
          { id: "hdfc_growth_loan", name: "HDFC Business Growth Loan", rate: 11.25, rating: "4.7", features: "Collateral-free business credit up to ₹50 Lakhs" },
          { id: "hdfc_working_cap", name: "HDFC Working Capital Facility", rate: 9.75, rating: "4.8", features: "Cash credit and overdraft tailored to cashflow cycles" }
        ],
        "Loan Against Property (LAP)": [
          { id: "hdfc_lap", name: "HDFC Loan Against Property", rate: 9.25, rating: "4.7", features: "Tenure up to 15 years against residential or commercial units" }
        ],
        "Agriculture & Rural Loans": [
          { id: "hdfc_kisan_dhan", name: "HDFC Kisan Dhan Vikas", rate: 7.20, rating: "4.6", features: "Fast rural credit for machinery and crop cycles" }
        ]
      },
      investments: [
        { name: "HDFC Senior Care FD (55 Months)", return: "7.75%", lockIn: "55 Months", risk: "Low", tax: "Standard FD Slabs", bestFitRisk: "Low" },
        { name: "HDFC Premium Special FD (35M)", return: "7.25%", lockIn: "35 Months", risk: "Low", tax: "Fixed Return", bestFitRisk: "Low" },
        { name: "HDFC Flexi Cap Mutual Fund SIP", return: "15.4%", lockIn: "None", risk: "High", tax: "LTCG Equity", bestFitRisk: "High" },
        { name: "HDFC ELSS Tax Saver", return: "14.1%", lockIn: "3y", risk: "Medium-High", tax: "Section 80C Benefit", bestFitRisk: "Medium" }
      ]
    },
    {
      id: "ICICI",
      name: "ICICI Bank",
      shortName: "ICICI Bank",
      rating: "4.7",
      url: "https://icicibank.com",
      logoColor: "#c2410c",
      loans: {
        "Housing Loans": [
          { id: "icici_express_home", name: "ICICI Express Home Loan", rate: 8.75, rating: "4.8", features: "Instant provisional approval online within minutes" },
          { id: "icici_money_saver", name: "ICICI Money Saver Home Loan", rate: 8.95, rating: "4.7", features: "Overdraft facility to reduce interest payout" },
          { id: "icici_stepup", name: "ICICI Step-Up Home Loan", rate: 8.80, rating: "4.6", features: "Lower initial EMIs stepping up as career income expands" },
          { id: "icici_extra_home", name: "ICICI Extra Home Loan", rate: 8.90, rating: "4.5", features: "Enhance borrowing limit by up to 20% with mortgage guarantee" }
        ],
        "Personal Loans": [
          { id: "icici_insta_pl", name: "ICICI Insta Personal Loan", rate: 10.60, rating: "4.7", features: "Disbursal directly to account in 3 seconds for pre-approved users" },
          { id: "icici_express_pl", name: "ICICI Salaried Express PL", rate: 10.80, rating: "4.6", features: "Competitive rate structure with online document upload" }
        ],
        "Vehicle Loans": [
          { id: "icici_express_car", name: "ICICI Car Loan Express", rate: 8.80, rating: "4.7", features: "Paperless instant auto loan approval" }
        ],
        "Education Loans": [
          { id: "icici_overseas_edu", name: "ICICI Student Overseas Education", rate: 9.30, rating: "4.7", features: "Up to ₹1 Cr without collateral for selected universities" }
        ],
        "Gold Loans": [
          { id: "icici_gold", name: "ICICI Express Gold Loan", rate: 8.85, rating: "4.6", features: "Quick appraisal across thousands of branches" }
        ],
        "Business & MSME Loans": [
          { id: "icici_insta_od", name: "ICICI InstaOD for MSMEs", rate: 10.50, rating: "4.7", features: "Instant unsecured overdraft up to ₹50 Lakhs" }
        ],
        "Loan Against Property (LAP)": [
          { id: "icici_lap", name: "ICICI Property Power Loan", rate: 9.20, rating: "4.6", features: "High loan amount with flexible tenure up to 15 years" }
        ],
        "Agriculture & Rural Loans": [
          { id: "icici_kisan", name: "ICICI Kisan Credit Card", rate: 7.25, rating: "4.5", features: "Quick rural finance for equipment and seeds" }
        ]
      },
      investments: [
        { name: "ICICI Golden Years FD (5y+)", return: "7.50%", lockIn: "5 Years", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" },
        { name: "ICICI Pru Bluechip Mutual Fund", return: "14.6%", lockIn: "None", risk: "Medium", tax: "LTCG Equity", bestFitRisk: "Medium" },
        { name: "ICICI Pru Value Discovery Fund", return: "16.1%", lockIn: "None", risk: "High", tax: "LTCG Equity", bestFitRisk: "High" }
      ]
    },
    {
      id: "AXIS",
      name: "Axis Bank",
      shortName: "Axis Bank",
      rating: "4.6",
      url: "https://axisbank.com",
      logoColor: "#831843",
      loans: {
        "Housing Loans": [
          { id: "axis_std_home", name: "Axis Bank Regular Home Loan", rate: 8.75, rating: "4.7", features: "Transparent terms, competitive interest calculation" },
          { id: "axis_shubh_aarambh", name: "Axis Shubh Aarambh Home Loan", rate: 8.90, rating: "4.8", features: "12 EMI waivers on timely repayments during tenure" },
          { id: "axis_fast_forward", name: "Axis Fast Forward Housing Loan", rate: 8.85, rating: "4.6", features: "6-month EMI waivers at end of 10th and 15th year" },
          { id: "axis_super_saver", name: "Axis Super Saver Home Loan", rate: 9.05, rating: "4.5", features: "Overdraft facility to park surplus and save interest" }
        ],
        "Personal Loans": [
          { id: "axis_24x7_pl", name: "Axis 24x7 Instant Personal Loan", rate: 10.75, rating: "4.7", features: "Fully digital instant credit line" }
        ],
        "Vehicle Loans": [
          { id: "axis_auto", name: "Axis Auto Loan", rate: 8.85, rating: "4.6", features: "Competitive financing on new and pre-owned cars" }
        ],
        "Education Loans": [
          { id: "axis_edu", name: "Axis Prime Education Loan", rate: 9.35, rating: "4.6", features: "100% financing for international university tuition" }
        ],
        "Gold Loans": [
          { id: "axis_gold", name: "Axis Gold Loan Facility", rate: 8.90, rating: "4.5", features: "Fast disbursement, flexible repayment" }
        ],
        "Business & MSME Loans": [
          { id: "axis_business", name: "Axis Business Growth Loan", rate: 11.50, rating: "4.6", features: "Unsecured business loans up to ₹50 Lakhs" }
        ],
        "Loan Against Property (LAP)": [
          { id: "axis_lap", name: "Axis Loan Against Property", rate: 9.30, rating: "4.5", features: "Long tenure property mortgage for retail & business" }
        ],
        "Agriculture & Rural Loans": [
          { id: "axis_kcc", name: "Axis Kisan Credit Card", rate: 7.20, rating: "4.5", features: "Crop loan and tractor financing" }
        ]
      },
      investments: [
        { name: "Axis Fixed Deposit (17 Months)", return: "7.20%", lockIn: "17 Months", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" },
        { name: "Axis Small Cap Mutual Fund SIP", return: "17.2%", lockIn: "None", risk: "High", tax: "LTCG Equity", bestFitRisk: "High" }
      ]
    },
    {
      id: "KOTAK",
      name: "Kotak Mahindra Bank",
      shortName: "Kotak Bank",
      rating: "4.7",
      url: "https://kotak.com",
      logoColor: "#dc2626",
      loans: {
        "Housing Loans": [
          { id: "kotak_digi_home", name: "Kotak Digi Home Loan", rate: 8.70, rating: "4.8", features: "Zero processing fee promotions, competitive rate structure" },
          { id: "kotak_nri_home", name: "Kotak NRI Home Loan", rate: 8.85, rating: "4.7", features: "Specialized for Non-Resident Indians purchasing property in India" },
          { id: "kotak_balance_transfer", name: "Kotak Home Loan Balance Transfer", rate: 8.65, rating: "4.8", features: "Subsidized rate to switch existing expensive mortgage" }
        ],
        "Personal Loans": [
          { id: "kotak_instant_pl", name: "Kotak Instant Personal Loan", rate: 10.75, rating: "4.6", features: "Rapid disbursal with transparent charges" }
        ],
        "Vehicle Loans": [
          { id: "kotak_car", name: "Kotak Prime Auto Loan", rate: 8.80, rating: "4.7", features: "Fast approvals through Kotak Prime division" }
        ],
        "Education Loans": [
          { id: "kotak_edu", name: "Kotak Education Loan", rate: 9.40, rating: "4.5", features: "Financing for recognized undergraduate and postgraduate degrees" }
        ],
        "Gold Loans": [
          { id: "kotak_gold", name: "Kotak Gold Loan Scheme", rate: 8.90, rating: "4.5", features: "Safe vault storage, low interest" }
        ],
        "Business & MSME Loans": [
          { id: "kotak_business", name: "Kotak Business Loan", rate: 11.25, rating: "4.6", features: "Clean working capital for expanding enterprises" }
        ],
        "Loan Against Property (LAP)": [
          { id: "kotak_lap", name: "Kotak Property Mortgage", rate: 9.25, rating: "4.5", features: "Tenure up to 15 years against residential/commercial assets" }
        ],
        "Agriculture & Rural Loans": [
          { id: "kotak_rural", name: "Kotak Agri Finance", rate: 7.30, rating: "4.5", features: "Rural machinery and micro-irrigation funding" }
        ]
      },
      investments: [
        { name: "Kotak Active FD (390 Days)", return: "7.15%", lockIn: "390 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" },
        { name: "Kotak Emerging Equity Fund SIP", return: "15.8%", lockIn: "None", risk: "High", tax: "LTCG Equity", bestFitRisk: "High" }
      ]
    },
    {
      id: "IDBI",
      name: "IDBI Bank",
      shortName: "IDBI Bank",
      rating: "4.5",
      url: "https://idbibank.in",
      logoColor: "#800020",
      loans: {
        "Housing Loans": [
          { id: "idbi_vanilla", name: "IDBI Plain Vanilla Home Loan", rate: 8.50, rating: "4.5", features: "Traditional low-cost home loan with zero hidden charges" },
          { id: "idbi_rural", name: "IDBI Rural & Semi-Urban Housing", rate: 8.50, rating: "4.3", features: "Affordable credit guidelines for non-metro property buyers" },
          { id: "idbi_ultra", name: "IDBI Home Loan Ultra Saver", rate: 8.90, rating: "4.4", features: "Savings account linked overdraft facility to trim interest" },
          { id: "idbi_plot", name: "IDBI Plot Loan for Construction", rate: 9.90, rating: "4.2", features: "Combined facility for residential plot and construction" }
        ],
        "Personal Loans": [
          { id: "idbi_sanjeevani", name: "IDBI Sanjeevani Personal Loan", rate: 9.50, rating: "4.4", features: "Emergency personal liquidity for medical & family needs" },
          { id: "idbi_suvidha", name: "IDBI Suvidha Top-Up Loan", rate: 8.70, rating: "4.2", features: "Top-up facility on existing IDBI relationships" }
        ],
        "Vehicle Loans": [
          { id: "idbi_auto", name: "IDBI Auto Loan", rate: 8.85, rating: "4.4", features: "Financing for cars and multi-utility vehicles" }
        ],
        "Education Loans": [
          { id: "idbi_edu", name: "IDBI Education Loan", rate: 8.90, rating: "4.5", features: "Comprehensive academic fee financing in India & abroad" }
        ],
        "Gold Loans": [
          { id: "idbi_gold", name: "IDBI Gold Loan Scheme", rate: 8.75, rating: "4.5", features: "Convenient loan against gold jewelry" }
        ],
        "Business & MSME Loans": [
          { id: "idbi_msme", name: "IDBI MSME Sahay", rate: 9.35, rating: "4.3", features: "Collateral assistance for manufacturing and service firms" }
        ],
        "Loan Against Property (LAP)": [
          { id: "idbi_prop_power", name: "IDBI Property Power (LAP)", rate: 9.00, rating: "4.1", features: "Long-term liquidity secured by property" }
        ],
        "Agriculture & Rural Loans": [
          { id: "idbi_kisan", name: "IDBI Kisan Credit Card", rate: 7.00, rating: "4.6", features: "Timely agricultural support for seasonal farming" }
        ]
      },
      investments: [
        { name: "IDBI Utsav Special FD (700 Days)", return: "7.05%", lockIn: "700 Days", risk: "Low", tax: "Regular Bank FD Rates", bestFitRisk: "Low" },
        { name: "IDBI Vasundhara Green Deposit", return: "6.75%", lockIn: "1111 Days", risk: "Low", tax: "Green Infrastructure Pool", bestFitRisk: "Low" },
        { name: "IDBI Mutual Fund SIP (Flexi-Cap)", return: "13.2%", lockIn: "None (Open)", risk: "Medium-High", tax: "Equity Capital Gains", bestFitRisk: "Medium" },
        { name: "IDBI Equity Linked Saving Scheme (ELSS)", return: "12.8%", lockIn: "3y", risk: "High", tax: "Section 80C Tax Saver", bestFitRisk: "Medium" }
      ]
    },
    {
      id: "INDUSIND",
      name: "IndusInd Bank",
      shortName: "IndusInd Bank",
      rating: "4.5",
      url: "https://indusind.com",
      logoColor: "#991b1b",
      loans: {
        "Housing Loans": [
          { id: "indus_home", name: "IndusInd Home Loan", rate: 8.75, rating: "4.6", features: "Tailored for both salaried and self-employed entrepreneurs" },
          { id: "indus_topup", name: "IndusInd Home Top-Up", rate: 9.00, rating: "4.4", features: "Convenient additional borrowing against property equity" }
        ],
        "Personal Loans": [
          { id: "indus_pl", name: "IndusInd Instant Personal Loan", rate: 10.75, rating: "4.6", features: "100% paperless digital sanction within minutes" }
        ],
        "Vehicle Loans": [
          { id: "indus_auto", name: "IndusInd Auto Loan", rate: 8.85, rating: "4.7", features: "Pioneers in vehicle financing across India" }
        ],
        "Education Loans": [
          { id: "indus_edu", name: "IndusInd Education Loan", rate: 9.40, rating: "4.4", features: "Higher studies in India and overseas" }
        ],
        "Gold Loans": [
          { id: "indus_gold", name: "IndusInd Gold Loan", rate: 8.95, rating: "4.5", features: "High per-gram rate with secure vaulting" }
        ],
        "Business & MSME Loans": [
          { id: "indus_business", name: "IndusInd Business Instalment Loan", rate: 11.50, rating: "4.6", features: "Working capital and equipment loans" }
        ],
        "Loan Against Property (LAP)": [
          { id: "indus_lap", name: "IndusInd Loan Against Property", rate: 9.35, rating: "4.4", features: "Secured funding up to ₹10 Crores" }
        ],
        "Agriculture & Rural Loans": [
          { id: "indus_rural", name: "IndusInd Rural & Tractor Finance", rate: 7.50, rating: "4.5", features: "Farm mechanization and harvest financing" }
        ]
      },
      investments: [
        { name: "IndusInd Indus Grand FD (1y 7m)", return: "7.75%", lockIn: "1 Year 7 Months", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "FEDERAL",
      name: "Federal Bank",
      shortName: "Federal Bank",
      rating: "4.6",
      url: "https://federalbank.co.in",
      logoColor: "#1d4ed8",
      loans: {
        "Housing Loans": [
          { id: "fed_housing", name: "Federal Housing Scheme", rate: 8.70, rating: "4.7", features: "Popular among NRI and domestic buyers; attractive interest rates" },
          { id: "fed_plot", name: "Federal Plot Loan", rate: 9.10, rating: "4.5", features: "For buying approved residential plots" }
        ],
        "Personal Loans": [
          { id: "fed_pl", name: "Federal FedPremia Personal Loan", rate: 10.60, rating: "4.6", features: "Instant credit via FedMobile application" }
        ],
        "Vehicle Loans": [
          { id: "fed_auto", name: "Federal Auto Loan", rate: 8.80, rating: "4.6", features: "Up to 100% ex-showroom funding" }
        ],
        "Education Loans": [
          { id: "fed_edu", name: "FedScholar Education Loan", rate: 9.15, rating: "4.6", features: "Comprehensive course fee financing" }
        ],
        "Gold Loans": [
          { id: "fed_gold", name: "Federal Digigold Loan", rate: 8.70, rating: "4.8", features: "Doorstep gold loan service and 24x7 top-up" }
        ],
        "Business & MSME Loans": [
          { id: "fed_msme", name: "Federal MSME Sanjeevani", rate: 9.40, rating: "4.5", features: "Tailored credit facilities for small units" }
        ],
        "Loan Against Property (LAP)": [
          { id: "fed_lap", name: "Federal Property Mortgage", rate: 9.20, rating: "4.4", features: "Secured credit against commercial/residential holdings" }
        ],
        "Agriculture & Rural Loans": [
          { id: "fed_kcc", name: "Federal Kisan Credit Card", rate: 7.10, rating: "4.6", features: "Agricultural inputs and warehouse receipt funding" }
        ]
      },
      investments: [
        { name: "Federal Bank Special FD (400 Days)", return: "7.40%", lockIn: "400 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    }
  ],

  "Small Finance Banks": [
    {
      id: "AU_SFB",
      name: "AU Small Finance Bank",
      shortName: "AU Small Finance Bank",
      rating: "4.6",
      url: "https://aubank.in",
      logoColor: "#7c3aed",
      loans: {
        "Housing Loans": [
          { id: "au_home", name: "AU Regular Home Loan", rate: 9.40, rating: "4.6", features: "Tailored for unserved and underserved semi-urban home buyers" },
          { id: "au_affordable", name: "AU Affordable Housing Loan", rate: 9.65, rating: "4.5", features: "Flexible income verification for informal earners" },
          { id: "au_sudhar", name: "AU Griha Sudhar Renovation", rate: 10.15, rating: "4.4", features: "Credit for home extension, tiling and roofing" }
        ],
        "Personal Loans": [
          { id: "au_pl", name: "AU Instant Personal Loan", rate: 11.50, rating: "4.5", features: "Paperless digital disbursal up to ₹5 Lakhs" }
        ],
        "Vehicle Loans": [
          { id: "au_auto", name: "AU Wheels Auto Loan", rate: 9.25, rating: "4.7", features: "Finance for new and certified pre-owned vehicles" }
        ],
        "Education Loans": [
          { id: "au_edu", name: "AU Vidya Loan", rate: 9.75, rating: "4.4", features: "Higher education funding for vocational & degree courses" }
        ],
        "Gold Loans": [
          { id: "au_gold", name: "AU Gold Loan", rate: 8.95, rating: "4.6", features: "Competitive per-gram valuation and minimal processing" }
        ],
        "Business & MSME Loans": [
          { id: "au_vyapaar", name: "AU Vyapaar Business Loan", rate: 11.25, rating: "4.7", features: "Dedicated to small traders, grocery stores & merchants" }
        ],
        "Loan Against Property (LAP)": [
          { id: "au_lap", name: "AU Loan Against Property", rate: 9.85, rating: "4.5", features: "Secured financing for self-employed shop owners" }
        ],
        "Agriculture & Rural Loans": [
          { id: "au_kisan", name: "AU Kisan Credit Loan", rate: 7.50, rating: "4.5", features: "Farm cash credit in Rajasthan, MP, Gujarat & beyond" }
        ]
      },
      investments: [
        { name: "AU High-Yield FD (24-36 Months)", return: "8.00%", lockIn: "24-36 Months", risk: "Low (DICGC Protected)", tax: "Standard FD", bestFitRisk: "Low" },
        { name: "AU Senior Citizen Special (18M)", return: "8.50%", lockIn: "18 Months", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "EQUITAS_SFB",
      name: "Equitas Small Finance Bank",
      shortName: "Equitas SFB",
      rating: "4.5",
      url: "https://equitasbank.com",
      logoColor: "#0284c7",
      loans: {
        "Housing Loans": [
          { id: "eq_griha", name: "Equitas Griha Nirman Loan", rate: 9.75, rating: "4.5", features: "Housing credit for self-employed professionals without formal ITR" },
          { id: "eq_plot", name: "Equitas Plot & Construction", rate: 10.20, rating: "4.4", features: "Land purchase with staged construction release" }
        ],
        "Personal Loans": [
          { id: "eq_pl", name: "Equitas Micro-Personal Credit", rate: 12.00, rating: "4.4", features: "Rapid personal credit for retail customers" }
        ],
        "Vehicle Loans": [
          { id: "eq_vehicle", name: "Equitas Commercial & Car Finance", rate: 9.50, rating: "4.6", features: "Passenger cars and light commercial vehicles" }
        ],
        "Education Loans": [
          { id: "eq_edu", name: "Equitas Shiksha Sahay", rate: 10.00, rating: "4.3", features: "Support for vocational and undergraduate studies" }
        ],
        "Gold Loans": [
          { id: "eq_gold", name: "Equitas Gold Loan", rate: 9.00, rating: "4.6", features: "Instant sanction against gold jewelry" }
        ],
        "Business & MSME Loans": [
          { id: "eq_msme", name: "Equitas Enterprise Micro-Credit", rate: 11.50, rating: "4.6", features: "Working capital for small workshops and shops" }
        ],
        "Loan Against Property (LAP)": [
          { id: "eq_lap", name: "Equitas Property Mortgage", rate: 10.10, rating: "4.4", features: "Secured credit against self-occupied residential unit" }
        ],
        "Agriculture & Rural Loans": [
          { id: "eq_agri", name: "Equitas Agri Allied Loan", rate: 7.80, rating: "4.5", features: "Dairy, poultry and micro-farming loans" }
        ]
      },
      investments: [
        { name: "Equitas Smart FD (444 Days)", return: "8.25%", lockIn: "444 Days", risk: "Low (DICGC Protected)", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "UJJIVAN_SFB",
      name: "Ujjivan Small Finance Bank",
      shortName: "Ujjivan SFB",
      rating: "4.5",
      url: "https://ujjivansfb.in",
      logoColor: "#d97706",
      loans: {
        "Housing Loans": [
          { id: "uj_home", name: "Ujjivan Affordable Housing Scheme", rate: 9.60, rating: "4.5", features: "Low documentation barrier, rapid doorstep evaluation" },
          { id: "uj_micro", name: "Ujjivan Micro-Mortgage Loan", rate: 10.30, rating: "4.3", features: "Compact home loan sizes for semi-urban dwellings" }
        ],
        "Personal Loans": [
          { id: "uj_pl", name: "Ujjivan Personal Loan", rate: 11.75, rating: "4.4", features: "Rapid retail credit for urgent expenses" }
        ],
        "Vehicle Loans": [
          { id: "uj_vehicle", name: "Ujjivan Two-Wheeler & Auto", rate: 9.60, rating: "4.5", features: "Competitive vehicle finance" }
        ],
        "Education Loans": [
          { id: "uj_edu", name: "Ujjivan Education Support", rate: 10.20, rating: "4.3", features: "College and vocational fee assistance" }
        ],
        "Gold Loans": [
          { id: "uj_gold", name: "Ujjivan Swarna Loan", rate: 9.10, rating: "4.5", features: "Transparent valuation with safety vaults" }
        ],
        "Business & MSME Loans": [
          { id: "uj_business", name: "Ujjivan Micro-Business Loan", rate: 11.75, rating: "4.6", features: "Working capital for retail merchants and entrepreneurs" }
        ],
        "Loan Against Property (LAP)": [
          { id: "uj_lap", name: "Ujjivan Secured Business LAP", rate: 10.25, rating: "4.4", features: "Funding against residential or shop property" }
        ],
        "Agriculture & Rural Loans": [
          { id: "uj_agri", name: "Ujjivan Rural Credit", rate: 7.75, rating: "4.5", features: "Financing for crop input and cattle" }
        ]
      },
      investments: [
        { name: "Ujjivan Platina FD (12-15 Months)", return: "8.25%", lockIn: "15 Months", risk: "Low (DICGC Protected)", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "JANA_SFB",
      name: "Jana Small Finance Bank",
      shortName: "Jana SFB",
      rating: "4.4",
      url: "https://janabank.com",
      logoColor: "#059669",
      loans: {
        "Housing Loans": [
          { id: "jana_home", name: "Jana Griha Vikas Home Loan", rate: 9.75, rating: "4.5", features: "Accessible housing credit for non-salaried earners" }
        ],
        "Personal Loans": [
          { id: "jana_pl", name: "Jana Quick Personal Loan", rate: 12.25, rating: "4.3", features: "Fast retail funding" }
        ],
        "Vehicle Loans": [
          { id: "jana_vehicle", name: "Jana Auto Loan", rate: 9.70, rating: "4.4", features: "Affordable auto funding" }
        ],
        "Education Loans": [
          { id: "jana_edu", name: "Jana Vidya Loan", rate: 10.30, rating: "4.2", features: "College fee support" }
        ],
        "Gold Loans": [
          { id: "jana_gold", name: "Jana Gold Loan", rate: 9.20, rating: "4.5", features: "Fast disbursal on gold ornaments" }
        ],
        "Business & MSME Loans": [
          { id: "jana_msme", name: "Jana Pragati Business Loan", rate: 11.90, rating: "4.5", features: "Credit for unorganized micro businesses" }
        ],
        "Loan Against Property (LAP)": [
          { id: "jana_lap", name: "Jana Loan Against Property", rate: 10.40, rating: "4.3", features: "Secured business financing" }
        ],
        "Agriculture & Rural Loans": [
          { id: "jana_agri", name: "Jana Krishi Vikas", rate: 7.90, rating: "4.4", features: "Crop and livestock credit line" }
        ]
      },
      investments: [
        { name: "Jana High-Return FD (365 Days)", return: "8.25%", lockIn: "365 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "CAPITAL_SFB",
      name: "Capital Small Finance Bank",
      shortName: "Capital SFB",
      rating: "4.4",
      url: "https://capitalbank.co.in",
      logoColor: "#0f766e",
      loans: {
        "Housing Loans": [
          { id: "cap_home", name: "Capital Niwas Home Loan", rate: 9.50, rating: "4.5", features: "Pioneering community-first housing credit in Northern India" }
        ],
        "Personal Loans": [
          { id: "cap_pl", name: "Capital Personal Credit", rate: 11.80, rating: "4.4", features: "Support for festive, family, and medical expenses" }
        ],
        "Vehicle Loans": [
          { id: "cap_auto", name: "Capital Auto Loan", rate: 9.40, rating: "4.5", features: "Financing for four-wheelers and tractors" }
        ],
        "Education Loans": [
          { id: "cap_edu", name: "Capital Education Loan", rate: 9.90, rating: "4.3", features: "Indian and foreign study financing" }
        ],
        "Gold Loans": [
          { id: "cap_gold", name: "Capital Gold Loan", rate: 9.00, rating: "4.5", features: "Low interest against 22K gold" }
        ],
        "Business & MSME Loans": [
          { id: "cap_msme", name: "Capital Vyapar MSME", rate: 11.50, rating: "4.5", features: "Term loan and cash credit" }
        ],
        "Loan Against Property (LAP)": [
          { id: "cap_lap", name: "Capital Mortgage Loan", rate: 10.15, rating: "4.3", features: "Property-backed business expansion" }
        ],
        "Agriculture & Rural Loans": [
          { id: "cap_agri", name: "Capital Kisan Card", rate: 7.50, rating: "4.6", features: "Prompt rural credit release" }
        ]
      },
      investments: [
        { name: "Capital Special FD (400 Days)", return: "7.75%", lockIn: "400 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    }
  ],

  "Regional Rural Banks": [
    {
      id: "ARYAVART",
      name: "Aryavart Bank",
      shortName: "Aryavart Bank",
      rating: "4.5",
      url: "https://aryavart-rrb.com",
      logoColor: "#047857",
      loans: {
        "Housing Loans": [
          { id: "ary_awas", name: "Aryavart Gramin Awas Yojana", rate: 8.65, rating: "4.6", features: "Subsidized rural home construction backed by Bank of India sponsorship" },
          { id: "ary_shelter", name: "Aryavart Rural Housing Scheme", rate: 8.85, rating: "4.4", features: "Renovation and enlargement of village dwellings" }
        ],
        "Personal Loans": [
          { id: "ary_karmi", name: "Aryavart Karmi Personal Loan", rate: 10.75, rating: "4.4", features: "Credit for rural school teachers and local govt staff" }
        ],
        "Vehicle Loans": [
          { id: "ary_auto", name: "Aryavart Vahan Rin", rate: 8.95, rating: "4.5", features: "Two-wheeler and rural passenger vehicle loan" }
        ],
        "Education Loans": [
          { id: "ary_vidya", name: "Aryavart Gyan Deep Education", rate: 8.80, rating: "4.5", features: "Affordable loan for rural students entering college" }
        ],
        "Gold Loans": [
          { id: "ary_gold", name: "Aryavart Swarna Rin", rate: 8.70, rating: "4.6", features: "Prompt gold credit without complex paperwork" }
        ],
        "Business & MSME Loans": [
          { id: "ary_mudra", name: "Aryavart PMMY Mudra Yojana", rate: 9.25, rating: "4.6", features: "For village shopkeepers, tailoring units, and cottage crafts" }
        ],
        "Loan Against Property (LAP)": [
          { id: "ary_lap", name: "Aryavart Property Mortgage", rate: 9.50, rating: "4.3", features: "Leverage pucca property for retail business" }
        ],
        "Agriculture & Rural Loans": [
          { id: "ary_kcc", name: "Aryavart Kisan Credit Card", rate: 7.00, rating: "4.8", features: "Direct input financing for UP farmers" }
        ]
      },
      investments: [
        { name: "Aryavart Samriddhi Term Deposit (1Y)", return: "7.10%", lockIn: "1 Year", risk: "Low (Sovereign Sponsored)", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "BARODA_UP",
      name: "Baroda UP Bank",
      shortName: "Baroda UP Bank",
      rating: "4.5",
      url: "https://barodaupbank.in",
      logoColor: "#c2410c",
      loans: {
        "Housing Loans": [
          { id: "bup_home", name: "Baroda UP Gramin Home Loan", rate: 8.60, rating: "4.6", features: "Affordable home loans for rural and semi-urban Uttar Pradesh" },
          { id: "bup_renovate", name: "Baroda UP House Renovation", rate: 8.90, rating: "4.4", features: "Roofing, sanitation and extra room construction" }
        ],
        "Personal Loans": [
          { id: "bup_pl", name: "Baroda UP Sahaj Personal Loan", rate: 10.80, rating: "4.4", features: "Personal emergency funding for salaried and pension holders" }
        ],
        "Vehicle Loans": [
          { id: "bup_vehicle", name: "Baroda UP Vahan Loan", rate: 8.90, rating: "4.5", features: "Financing for private and commercial vehicles" }
        ],
        "Education Loans": [
          { id: "bup_edu", name: "Baroda UP Vidya Rin", rate: 8.75, rating: "4.5", features: "Higher education support for recognized universities" }
        ],
        "Gold Loans": [
          { id: "bup_gold", name: "Baroda UP Gold Loan", rate: 8.65, rating: "4.7", features: "Fast approval against agricultural/household gold" }
        ],
        "Business & MSME Loans": [
          { id: "bup_mudra", name: "Baroda UP Mudra Shishu/Kishor", rate: 9.15, rating: "4.6", features: "Micro-business seed and operational capital" }
        ],
        "Loan Against Property (LAP)": [
          { id: "bup_lap", name: "Baroda UP Mortgage Scheme", rate: 9.45, rating: "4.3", features: "Secured credit against commercial or residential property" }
        ],
        "Agriculture & Rural Loans": [
          { id: "bup_kcc", name: "Baroda UP Kisan Credit Card", rate: 7.00, rating: "4.8", features: "Seasonal crop credit with zero delay" }
        ]
      },
      investments: [
        { name: "Baroda UP Gramin Vikas FD (400D)", return: "7.15%", lockIn: "400 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "KERALA_GRAMIN",
      name: "Kerala Gramin Bank",
      shortName: "Kerala Gramin Bank",
      rating: "4.6",
      url: "https://keralagbank.com",
      logoColor: "#0284c7",
      loans: {
        "Housing Loans": [
          { id: "kgb_awas", name: "KGB Awas Home Loan", rate: 8.50, rating: "4.7", features: "One of India's largest RRBs, sponsored by Canara Bank; excellent terms" },
          { id: "kgb_grihalakshmi", name: "KGB Grihalakshmi Housing", rate: 8.55, rating: "4.6", features: "Special concession for women co-applicants" }
        ],
        "Personal Loans": [
          { id: "kgb_mithra", name: "KGB Mithra Personal Loan", rate: 10.50, rating: "4.5", features: "Easy repayment terms for regular salaried earners" }
        ],
        "Vehicle Loans": [
          { id: "kgb_auto", name: "KGB Vahana Auto Loan", rate: 8.80, rating: "4.6", features: "Automobile financing for personal and fleet use" }
        ],
        "Education Loans": [
          { id: "kgb_edu", name: "KGB Jnana Jyothi Education Loan", rate: 8.65, rating: "4.7", features: "Comprehensive funding for medical, engineering and overseas studies" }
        ],
        "Gold Loans": [
          { id: "kgb_gold", name: "KGB Swarna Gold Loan", rate: 8.50, rating: "4.8", features: "Highly popular in Kerala; maximum per-gram gold valuation" }
        ],
        "Business & MSME Loans": [
          { id: "kgb_msme", name: "KGB MSME Vikas Scheme", rate: 9.10, rating: "4.6", features: "Targeted support for coastal and agro-processing businesses" }
        ],
        "Loan Against Property (LAP)": [
          { id: "kgb_lap", name: "KGB Property Power", rate: 9.25, rating: "4.5", features: "Secured borrowing against titled land and buildings" }
        ],
        "Agriculture & Rural Loans": [
          { id: "kgb_kisan", name: "KGB Haritha Kisan Credit", rate: 7.00, rating: "4.8", features: "Spices, rubber, coconut and paddy plantation finance" }
        ]
      },
      investments: [
        { name: "KGB Haritha Term Deposit (1Y)", return: "7.20%", lockIn: "1 Year", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "KARNATAKA_GRAMIN",
      name: "Karnataka Gramin Bank",
      shortName: "Karnataka Gramin Bank",
      rating: "4.5",
      url: "https://karnatakagraminbank.com",
      logoColor: "#b91c1c",
      loans: {
        "Housing Loans": [
          { id: "kgrb_home", name: "Karnataka Gramin Home Loan", rate: 8.60, rating: "4.6", features: "Rural and semi-urban shelter financing backed by Canara Bank" }
        ],
        "Personal Loans": [
          { id: "kgrb_pl", name: "Karnataka Gramin Personal Loan", rate: 10.75, rating: "4.4", features: "Clean personal credit for state workers" }
        ],
        "Vehicle Loans": [
          { id: "kgrb_auto", name: "Karnataka Gramin Vahana Rin", rate: 8.90, rating: "4.5", features: "Light vehicle financing" }
        ],
        "Education Loans": [
          { id: "kgrb_edu", name: "Karnataka Gramin Vidya Scheme", rate: 8.70, rating: "4.6", features: "Higher education support" }
        ],
        "Gold Loans": [
          { id: "kgrb_gold", name: "Karnataka Gramin Gold Loan", rate: 8.60, rating: "4.7", features: "Quick disbursement against 22K gold" }
        ],
        "Business & MSME Loans": [
          { id: "kgrb_msme", name: "Karnataka Gramin Pragati MSME", rate: 9.20, rating: "4.5", features: "Small cottage unit assistance" }
        ],
        "Loan Against Property (LAP)": [
          { id: "kgrb_lap", name: "Karnataka Gramin Property Mortgage", rate: 9.40, rating: "4.3", features: "Long tenure secured credit" }
        ],
        "Agriculture & Rural Loans": [
          { id: "kgrb_kcc", name: "Karnataka Gramin Kisan Credit Card", rate: 7.00, rating: "4.8", features: "Comprehensive farming facility" }
        ]
      },
      investments: [
        { name: "Karnataka Gramin Samruddhi FD (400D)", return: "7.15%", lockIn: "400 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "APGVB",
      name: "Andhra Pradesh Grameena Vikas Bank (APGVB)",
      shortName: "AP Grameena Vikas Bank",
      rating: "4.5",
      url: "https://apgb.in",
      logoColor: "#15803d",
      loans: {
        "Housing Loans": [
          { id: "apgvb_home", name: "APGVB Gruha Shobha Home Loan", rate: 8.55, rating: "4.6", features: "Sponsored by SBI; robust rural housing support" }
        ],
        "Personal Loans": [
          { id: "apgvb_pl", name: "APGVB Employee Personal Credit", rate: 10.65, rating: "4.4", features: "Rapid personal credit" }
        ],
        "Vehicle Loans": [
          { id: "apgvb_auto", name: "APGVB Vahana Rin", rate: 8.85, rating: "4.5", features: "Vehicle funding" }
        ],
        "Education Loans": [
          { id: "apgvb_edu", name: "APGVB Vidya Jyothi", rate: 8.65, rating: "4.6", features: "Higher education loans" }
        ],
        "Gold Loans": [
          { id: "apgvb_gold", name: "APGVB Swarna Nidhi Gold Loan", rate: 8.55, rating: "4.7", features: "Low-interest gold pledge" }
        ],
        "Business & MSME Loans": [
          { id: "apgvb_msme", name: "APGVB Mudra Loan", rate: 9.15, rating: "4.6", features: "Micro business funding" }
        ],
        "Loan Against Property (LAP)": [
          { id: "apgvb_lap", name: "APGVB Mortgage Rin", rate: 9.35, rating: "4.4", features: "Secured credit against property" }
        ],
        "Agriculture & Rural Loans": [
          { id: "apgvb_kcc", name: "APGVB Kisan Credit Card", rate: 7.00, rating: "4.8", features: "Agri inputs and cotton/chili crop loans" }
        ]
      },
      investments: [
        { name: "APGVB Vikas Deposit (1Y)", return: "7.10%", lockIn: "1 Year", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    }
  ],

  "Cooperative Banks": [
    {
      id: "SARASWAT",
      name: "Saraswat Co-operative Bank",
      shortName: "Saraswat Bank",
      rating: "4.7",
      url: "https://saraswatbank.com",
      logoColor: "#9333ea",
      loans: {
        "Housing Loans": [
          { id: "sar_vastu", name: "Saraswat Vastu Siddhi Home Loan", rate: 8.60, rating: "4.7", features: "India's largest urban cooperative bank; highly transparent processing" },
          { id: "sar_plot", name: "Saraswat Plot & Villa Scheme", rate: 9.25, rating: "4.5", features: "Purchase of NA plot and individual bungalow construction" }
        ],
        "Personal Loans": [
          { id: "sar_utsav", name: "Saraswat Utsav Personal Loan", rate: 10.60, rating: "4.6", features: "Quick loan for personal, travel or wedding requirements" },
          { id: "sar_suvidha", name: "Saraswat Suvidha PL", rate: 10.85, rating: "4.5", features: "Hassle-free salary overdraft" }
        ],
        "Vehicle Loans": [
          { id: "sar_vahan", name: "Saraswat Vahan Auto Loan", rate: 8.80, rating: "4.6", features: "Up to 90% financing for new cars and electric vehicles" }
        ],
        "Education Loans": [
          { id: "sar_edu", name: "Saraswat Vidya Samvardhini", rate: 8.95, rating: "4.6", features: "Domestic and international professional degree financing" }
        ],
        "Gold Loans": [
          { id: "sar_gold", name: "Saraswat Suvarna Gold Loan", rate: 8.70, rating: "4.7", features: "Fast appraisal and lowest processing charges" }
        ],
        "Business & MSME Loans": [
          { id: "sar_business", name: "Saraswat Vyapar Vriddhi MSME", rate: 9.50, rating: "4.6", features: "Working capital and term credit for retail trade and small firms" }
        ],
        "Loan Against Property (LAP)": [
          { id: "sar_lap", name: "Saraswat Property Secured Facility", rate: 9.30, rating: "4.5", features: "Secured against residential or commercial real estate" }
        ],
        "Agriculture & Rural Loans": [
          { id: "sar_agri", name: "Saraswat Agri Allied Finance", rate: 7.50, rating: "4.4", features: "Greenhouse, cold storage and allied agricultural finance" }
        ]
      },
      investments: [
        { name: "Saraswat Amrit Deposit (400 Days)", return: "7.30%", lockIn: "400 Days", risk: "Low (DICGC Protected)", tax: "Standard FD", bestFitRisk: "Low" },
        { name: "Saraswat Senior Citizen Special (1Y)", return: "7.80%", lockIn: "1 Year", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "COSMOS",
      name: "Cosmos Co-operative Bank",
      shortName: "Cosmos Bank",
      rating: "4.6",
      url: "https://cosmosbank.com",
      logoColor: "#0284c7",
      loans: {
        "Housing Loans": [
          { id: "cos_shobha", name: "Cosmos Griha Shobha Home Loan", rate: 8.75, rating: "4.6", features: "Multi-state urban cooperative powerhouse; fast digital processing" },
          { id: "cos_niwas", name: "Cosmos Niwas Construction Loan", rate: 9.00, rating: "4.5", features: "Staged disbursement based on engineer completion certificates" }
        ],
        "Personal Loans": [
          { id: "cos_pl", name: "Cosmos Express Personal Loan", rate: 10.75, rating: "4.5", features: "Fast disbursement for medical and personal obligations" }
        ],
        "Vehicle Loans": [
          { id: "cos_vehicle", name: "Cosmos Auto Drive Loan", rate: 8.85, rating: "4.6", features: "Up to 85% on-road funding for four-wheelers" }
        ],
        "Education Loans": [
          { id: "cos_edu", name: "Cosmos Vidyarthi Loan", rate: 9.10, rating: "4.5", features: "Covering recognized degree and diploma courses" }
        ],
        "Gold Loans": [
          { id: "cos_gold", name: "Cosmos Suvarna Ratna", rate: 8.75, rating: "4.6", features: "Instant cash against gold ornaments" }
        ],
        "Business & MSME Loans": [
          { id: "cos_msme", name: "Cosmos Vyapar Business Loan", rate: 9.60, rating: "4.5", features: "Structured working capital for urban traders" }
        ],
        "Loan Against Property (LAP)": [
          { id: "cos_lap", name: "Cosmos Mortgage Advantage", rate: 9.40, rating: "4.4", features: "Secured borrowing against property in metro and semi-urban areas" }
        ],
        "Agriculture & Rural Loans": [
          { id: "cos_agri", name: "Cosmos Agro Infrastructure", rate: 7.75, rating: "4.4", features: "Packaging and agri-processing units" }
        ]
      },
      investments: [
        { name: "Cosmos Centennial Term Deposit (366D)", return: "7.35%", lockIn: "366 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "SVC",
      name: "Shamrao Vithal Co-operative Bank (SVC)",
      shortName: "SVC Bank",
      rating: "4.6",
      url: "https://svcbank.com",
      logoColor: "#b91c1c",
      loans: {
        "Housing Loans": [
          { id: "svc_home", name: "SVC Home Loan Scheme", rate: 8.70, rating: "4.7", features: "118+ years of legacy; transparent interest and minimal foreclosure fee" },
          { id: "svc_shelter", name: "SVC Shelter Top-Up Facility", rate: 9.10, rating: "4.5", features: "Top-up credit for interior design and home expansion" }
        ],
        "Personal Loans": [
          { id: "svc_pl", name: "SVC Sahaj Personal Loan", rate: 10.70, rating: "4.5", features: "Unsecured personal funding with simplified income evaluation" }
        ],
        "Vehicle Loans": [
          { id: "svc_auto", name: "SVC Drive Auto Loan", rate: 8.80, rating: "4.6", features: "Competitive vehicle funding with fast paperwork" }
        ],
        "Education Loans": [
          { id: "svc_edu", name: "SVC Shiksha Education Loan", rate: 9.05, rating: "4.6", features: "Financing for professional education in India and abroad" }
        ],
        "Gold Loans": [
          { id: "svc_gold", name: "SVC Gold Loan", rate: 8.70, rating: "4.7", features: "Quick loan against gold jewelry" }
        ],
        "Business & MSME Loans": [
          { id: "svc_msme", name: "SVC Udyog Business Loan", rate: 9.55, rating: "4.6", features: "Working capital, bank guarantees and LC facilities" }
        ],
        "Loan Against Property (LAP)": [
          { id: "svc_lap", name: "SVC Property Secured Loan", rate: 9.35, rating: "4.4", features: "High loan quantum against real estate collateral" }
        ],
        "Agriculture & Rural Loans": [
          { id: "svc_agri", name: "SVC Agri Allied Scheme", rate: 7.60, rating: "4.4", features: "Floriculture, horticulture and farm machinery" }
        ]
      },
      investments: [
        { name: "SVC Special Tenor Deposit (400 Days)", return: "7.30%", lockIn: "400 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "BHARAT_COOP",
      name: "Bharat Co-operative Bank",
      shortName: "Bharat Bank",
      rating: "4.5",
      url: "https://bharatbank.com",
      logoColor: "#1d4ed8",
      loans: {
        "Housing Loans": [
          { id: "bharat_home", name: "Bharat Griha Nirman Loan", rate: 8.75, rating: "4.6", features: "Multi-state urban cooperative catering to metropolitan homebuyers" }
        ],
        "Personal Loans": [
          { id: "bharat_pl", name: "Bharat Personal Loan", rate: 10.80, rating: "4.4", features: "Immediate liquidity for personal needs" }
        ],
        "Vehicle Loans": [
          { id: "bharat_auto", name: "Bharat Auto Loan", rate: 8.90, rating: "4.5", features: "Four-wheeler and commercial vehicle loan" }
        ],
        "Education Loans": [
          { id: "bharat_edu", name: "Bharat Vidya Loan", rate: 9.15, rating: "4.5", features: "Degree course financing" }
        ],
        "Gold Loans": [
          { id: "bharat_gold", name: "Bharat Gold Loan", rate: 8.75, rating: "4.6", features: "Express valuation on gold" }
        ],
        "Business & MSME Loans": [
          { id: "bharat_msme", name: "Bharat MSME Vyapar", rate: 9.65, rating: "4.5", features: "SME business loans" }
        ],
        "Loan Against Property (LAP)": [
          { id: "bharat_lap", name: "Bharat Property Loan", rate: 9.40, rating: "4.4", features: "Secured mortgage loan" }
        ],
        "Agriculture & Rural Loans": [
          { id: "bharat_agri", name: "Bharat Rural Allied Loan", rate: 7.75, rating: "4.4", features: "Agri business financing" }
        ]
      },
      investments: [
        { name: "Bharat Samruddhi FD (1Y)", return: "7.25%", lockIn: "1 Year", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    },
    {
      id: "TJSB",
      name: "TJSB Sahakari Bank",
      shortName: "TJSB Bank",
      rating: "4.6",
      url: "https://tjsbbank.co.in",
      logoColor: "#059669",
      loans: {
        "Housing Loans": [
          { id: "tjsb_home", name: "TJSB Real Home Loan", rate: 8.70, rating: "4.6", features: "Prominent scheduled cooperative bank in Maharashtra & Goa" }
        ],
        "Personal Loans": [
          { id: "tjsb_pl", name: "TJSB Instant Personal Loan", rate: 10.75, rating: "4.5", features: "Prompt retail credit line" }
        ],
        "Vehicle Loans": [
          { id: "tjsb_auto", name: "TJSB Vahan Rin", rate: 8.85, rating: "4.6", features: "Auto financing with speedy processing" }
        ],
        "Education Loans": [
          { id: "tjsb_edu", name: "TJSB Vidya Vardhini", rate: 9.00, rating: "4.5", features: "Higher education loan" }
        ],
        "Gold Loans": [
          { id: "tjsb_gold", name: "TJSB Suvarna Loan", rate: 8.70, rating: "4.7", features: "Instant gold appraisal" }
        ],
        "Business & MSME Loans": [
          { id: "tjsb_msme", name: "TJSB Business Pragati", rate: 9.50, rating: "4.6", features: "Tailored to local merchants" }
        ],
        "Loan Against Property (LAP)": [
          { id: "tjsb_lap", name: "TJSB Mortgage Credit", rate: 9.35, rating: "4.4", features: "Property-backed expansion loan" }
        ],
        "Agriculture & Rural Loans": [
          { id: "tjsb_agri", name: "TJSB Krishi Vikas", rate: 7.60, rating: "4.4", features: "Farm modernization finance" }
        ]
      },
      investments: [
        { name: "TJSB Pragati Term Deposit (400D)", return: "7.30%", lockIn: "400 Days", risk: "Low", tax: "Standard FD", bestFitRisk: "Low" }
      ]
    }
  ]
};

// ============================================================================
// UNIVERSAL GOVERNMENT-SPONSORED SAVINGS & WEALTH SCHEMES
// Available across all commercial and authorized scheduled banks in India
// ============================================================================
export const UNIVERSAL_GOVERNMENT_SCHEMES = [
  { 
    name: "Public Provident Fund (PPF)", 
    return: "7.1%", 
    lockIn: "15 Years", 
    risk: "Low (Sovereign Guaranteed)", 
    tax: "Triple Tax Exempt (EEE) - Section 80C",
    desc: "Long term disciplined wealth building with sovereign safety and tax exemption at deposit, accrual, and withdrawal."
  },
  { 
    name: "Sukanya Samriddhi Yojana (SSY)", 
    return: "8.2%", 
    lockIn: "21 Years (or marriage after 18)", 
    risk: "Low (Sovereign Guaranteed)", 
    tax: "Triple Tax Exempt (EEE) - Section 80C",
    desc: "Highest returning government savings instrument exclusively for the girl child, offering compound growth."
  },
  { 
    name: "Senior Citizen Savings Scheme (SCSS)", 
    return: "8.2%", 
    lockIn: "5 Years (extendable)", 
    risk: "Low (Sovereign Guaranteed)", 
    tax: "Section 80C Benefit (Interest Taxable)",
    desc: "Quarterly interest payout providing assured cashflow security for senior citizens aged 60 and above."
  },
  { 
    name: "National Savings Certificate (NSC)", 
    return: "7.7%", 
    lockIn: "5 Years", 
    risk: "Low (Sovereign Guaranteed)", 
    tax: "Section 80C Deductible",
    desc: "Safe fixed return savings backed by the Government of India, accepted as collateral for bank loans."
  },
  { 
    name: "Mahila Samman Savings Certificate", 
    return: "7.5%", 
    lockIn: "2 Years", 
    risk: "Low (Sovereign Guaranteed)", 
    tax: "Taxable as per Income Slab",
    desc: "Short tenor high-yield sovereign deposit exclusively for women and girl investors."
  },
  { 
    name: "Kisan Vikas Patra (KVP)", 
    return: "7.5%", 
    lockIn: "115 Months (Doubles Money)", 
    risk: "Low (Sovereign Guaranteed)", 
    tax: "Interest Taxable (No TDS)",
    desc: "Guaranteed doubling of capital over specified lock-in period with early encashment options."
  }
];
