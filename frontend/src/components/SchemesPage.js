import React, { useState, useMemo } from 'react';
import './SchemesPage.css';
import { useLanguage } from '../context/LanguageContext';

const MYSCHEME_DATA = [
  {
    id: 'pmjdy',
    title: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
    ministry: 'Ministry of Finance, Department of Financial Services',
    category: 'bfsi',
    categoryName: 'Banking & Financial',
    shortDesc: 'National Mission for Financial Inclusion providing universal access to banking facilities with at least one basic banking account for every household.',
    benefits: [
      'Zero minimum balance requirement',
      'Free RuPay Debit Card with ₹2 Lakh in-built accidental insurance cover',
      'Overdraft facility up to ₹10,000 to eligible account holders',
      'Direct Benefit Transfer (DBT) of government subsidies directly into account'
    ],
    eligibility: [
      'Any citizen of India aged 10 years and above',
      'Must not hold any other basic savings bank deposit account',
      'Simplified KYC documentation allowed for small accounts'
    ],
    documents: ['Aadhaar Card', 'PAN Card or Form 60', 'Passport photo'],
    howToApply: 'Visit any commercial bank branch (SBI, PNB, HDFC, ICICI, etc.) or Bank Mitra kiosk with your Aadhaar and passport photo to open an account instantly.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/pmjdy'
  },
  {
    id: 'pmjjby',
    title: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    ministry: 'Ministry of Finance',
    category: 'bfsi',
    categoryName: 'Insurance',
    shortDesc: 'A one-year life insurance scheme renewable year to year offering coverage for death due to any cause.',
    benefits: [
      '₹2,00,000 (2 Lakhs) life coverage payable to nominee upon death of the insured due to any reason',
      'Affordable annual premium of only ₹436 per annum',
      'Automatic auto-debit facility from bank/post office account'
    ],
    eligibility: [
      'Individuals aged 18 to 50 years holding a bank or post office savings account',
      'Consent to join / enable auto-debit of annual premium'
    ],
    documents: ['Aadhaar Card', 'Active Bank Account with NetBanking/Debit card'],
    howToApply: 'Log in to your bank’s Internet Banking or mobile app, go to the Insurance/Social Security section, and activate PMJJBY with one click.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/pmjjby'
  },
  {
    id: 'pmsby',
    title: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    ministry: 'Ministry of Finance',
    category: 'bfsi',
    categoryName: 'Insurance',
    shortDesc: 'Accident insurance scheme offering accidental death and disability cover at an ultra-low premium.',
    benefits: [
      '₹2,00,000 for accidental death or permanent total disability',
      '₹1,00,000 for permanent partial disability',
      'Extremely affordable annual premium of only ₹20 per year'
    ],
    eligibility: [
      'Individuals aged 18 to 70 years having a savings bank account',
      'Aadhaar is primary KYC for the bank account'
    ],
    documents: ['Aadhaar Card', 'Savings Bank Account'],
    howToApply: 'Available at any bank branch or online banking portal under Government Sponsored Schemes with auto-renewal consent.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/pmsby'
  },
  {
    id: 'apy',
    title: 'Atal Pension Yojana (APY)',
    ministry: 'Ministry of Finance / PFRDA',
    category: 'social',
    categoryName: 'Pension & Social Security',
    shortDesc: 'Guaranteed pension scheme administered by PFRDA focused on unorganized sector workers.',
    benefits: [
      'Guaranteed monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 per month after age 60',
      'Pension continues to spouse after subscriber’s death',
      'Full pension corpus returned to nominees upon death of both subscriber and spouse',
      'Tax benefits under Section 80CCD'
    ],
    eligibility: [
      'Indian citizens aged 18 to 40 years',
      'Must have a savings bank account',
      'Must not be an income tax payer (as per current rules)'
    ],
    documents: ['Aadhaar Card', 'Bank Account details', 'Mobile Number'],
    howToApply: 'Apply through your bank branch, online banking, or through the Protean (NSDL) APY portal.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/apy'
  },
  {
    id: 'pmmy',
    title: 'Pradhan Mantri Mudra Yojana (PMMY)',
    ministry: 'Ministry of Finance',
    category: 'business',
    categoryName: 'Business & MSME',
    shortDesc: 'Collateral-free institutional micro-credit for non-corporate, non-farm small and micro enterprises.',
    benefits: [
      'Shishu: Loans up to ₹50,000 for new entrepreneurs',
      'Kishore: Loans from ₹50,001 to ₹5,00,000 for expanding businesses',
      'Tarun: Loans from ₹5,00,001 up to ₹10,00,000 (extended to ₹20L under 2024 Budget for past repayers)',
      'No collateral security or processing charges for Shishu loans'
    ],
    eligibility: [
      'Any Indian citizen with a business plan for non-farm income-generating activity',
      'Artisans, shopkeepers, fruit/vegetable vendors, small manufacturing units'
    ],
    documents: ['Business proof / Udyam Registration', 'Identity & Address Proof', 'Bank statement of 6 months'],
    howToApply: 'Apply online via UdyamiMitra Portal (udyamimitra.in) or visit any commercial, regional rural, or small finance bank.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/pmmy'
  },
  {
    id: 'pmay',
    title: 'Pradhan Mantri Awas Yojana (PMAY - Urban / Gramin)',
    ministry: 'Ministry of Housing and Urban Affairs / Ministry of Rural Development',
    category: 'housing',
    categoryName: 'Housing & Shelter',
    shortDesc: 'Affordable housing mission ensuring all eligible urban and rural families have access to a pucca house with basic amenities.',
    benefits: [
      'Interest subsidy up to ₹2.67 Lakhs on housing loans under Credit Linked Subsidy Scheme (CLSS)',
      'Financial assistance up to ₹1.2 Lakh (plain areas) or ₹1.3 Lakh (hilly areas) for rural house construction',
      'Houses built with toilet, LPG, water, and electricity connections'
    ],
    eligibility: [
      'Beneficiary family must not own a pucca house anywhere in India',
      'Categorized under EWS (income up to ₹3L), LIG (₹3L to ₹6L), or MIG (₹6L to ₹18L)',
      'Female ownership or co-ownership mandatory in urban EWS/LIG'
    ],
    documents: ['Aadhaar', 'Income Certificate', 'Affidavit of no pucca house', 'Property documents'],
    howToApply: 'Apply via the official PMAY portal (pmaymis.gov.in) or apply for home loan with PMAY subsidy interest rate via your lending bank.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/pmay-u'
  },
  {
    id: 'ssy',
    title: 'Sukanya Samriddhi Yojana (SSY)',
    ministry: 'Ministry of Finance & Women and Child Development',
    category: 'women',
    categoryName: 'Women & Child',
    shortDesc: 'A flagship small deposit scheme under Beti Bachao Beti Padhao campaign promoting higher education and marriage savings for girls.',
    benefits: [
      'Attractive high sovereign interest rate (currently 8.2% p.a., compounded annually)',
      'Complete Triple-E (EEE) tax exemption: deposit, interest, and maturity amount are 100% tax-free under 80C',
      'Partial withdrawal up to 50% allowed for girl’s higher education after age 18'
    ],
    eligibility: [
      'Girl child below the age of 10 years',
      'Account opened and operated by natural or legal guardian',
      'Maximum 2 accounts per family (except in case of twins/triplets)'
    ],
    documents: ['Birth Certificate of the girl child', 'KYC documents of guardian', 'Photograph'],
    howToApply: 'Open at any Post Office or authorized branches of commercial banks (SBI, PNB, BoB, etc.) with a minimum initial deposit of ₹250.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/ssy'
  },
  {
    id: 'scss',
    title: 'Senior Citizens Savings Scheme (SCSS)',
    ministry: 'Ministry of Finance',
    category: 'social',
    categoryName: 'Senior Citizens',
    shortDesc: 'Government-backed savings scheme providing reliable, guaranteed quarterly income for retired seniors.',
    benefits: [
      'Guaranteed 8.2% annual interest rate paid out quarterly',
      'Maximum deposit ceiling increased to ₹30 Lakhs',
      'Tax deduction up to ₹1.5 Lakh under Section 80C',
      'Tenure of 5 years, extendable by another 3 years'
    ],
    eligibility: [
      'Indian citizens aged 60 years or above',
      'Retirees aged 55 to 60 who took voluntary retirement (VRS) can invest within 1 month of receipt of retirement benefits',
      'Retired Defence personnel above 50 years'
    ],
    documents: ['Age proof', 'Aadhaar / PAN', 'Retirement benefit details (if below 60)'],
    howToApply: 'Open an account through any public or designated private bank or India Post Office.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/scss'
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card (KCC) Scheme',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agri',
    categoryName: 'Agriculture & Rural',
    shortDesc: 'Provides timely and adequate credit to farmers for agricultural requirements, post-harvest expenses, and animal husbandry.',
    benefits: [
      'Concessional credit at 7% p.a., with 3% prompt repayment incentive, reducing effective rate to just 4%',
      'Hassle-free revolving credit card facility',
      'Collateral-free limit up to ₹1.60 Lakh (extended up to ₹3 Lakhs under tie-ups)',
      'Includes mandatory personal accident insurance'
    ],
    eligibility: [
      'All individual or joint borrower farmers, owner cultivators',
      'Tenant farmers, oral lessees, sharecroppers',
      'Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers'
    ],
    documents: ['Land ownership records / tenancy agreement', 'Aadhaar & PAN', 'Passport photo'],
    howToApply: 'Apply at any commercial bank, regional rural bank, or cooperative bank branch, or via the PM-KISAN portal.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/kcc'
  },
  {
    id: 'pmsvanidhi',
    title: 'PM SVANidhi (Street Vendor’s AtmaNirbhar Nidhi)',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'business',
    categoryName: 'Micro-Business & Street Vendors',
    shortDesc: 'Special micro-credit facility providing working capital loans to empower street vendors and hawkers.',
    benefits: [
      'Initial working capital collateral-free loan of ₹10,000 (1st tranche)',
      'Enhanced loan of ₹20,000 (2nd tranche) and ₹50,000 (3rd tranche) upon timely repayment',
      '7% interest subsidy credited directly to bank account on regular repayment',
      'Cashback incentive up to ₹1,200 per year for digital transactions'
    ],
    eligibility: [
      'Street vendors engaged in vending in urban areas',
      'Vendors possessing Certificate of Vending / ID Card issued by Urban Local Bodies (ULBs)'
    ],
    documents: ['Aadhaar Card', 'Vending Certificate / Letter of Recommendation from ULB', 'Bank Passbook'],
    howToApply: 'Apply directly through the PM SVANidhi Portal (pmsvanidhi.mohua.gov.in) or via local Common Service Centers (CSC).',
    officialUrl: 'https://www.myscheme.gov.in/schemes/pmsvanidhi'
  },
  {
    id: 'pmkisan',
    title: 'PM-KISAN Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agri',
    categoryName: 'Agriculture',
    shortDesc: 'Direct income support scheme providing guaranteed financial assistance to small and marginal farmer families across India.',
    benefits: [
      'Direct cash transfer of ₹6,000 per year transferred in three equal 4-monthly instalments of ₹2,000',
      'Money deposited directly into Aadhaar-linked bank accounts via DBT with zero intermediaries'
    ],
    eligibility: [
      'Farmer families holding cultivable land in their names',
      'Excludes institutional landholders, income tax payers, and serving/retired govt employees'
    ],
    documents: ['Aadhaar Card', 'Land holding documents (Khata / Khasra)', 'Aadhaar-seeded bank account'],
    howToApply: 'Self-register on pmkisan.gov.in under Farmer’s Corner or visit nearest Common Service Center (CSC).',
    officialUrl: 'https://www.myscheme.gov.in/schemes/pm-kisan'
  },
  {
    id: 'csis',
    title: 'Central Sector Interest Subsidy Scheme (CSIS)',
    ministry: 'Ministry of Education, Department of Higher Education',
    category: 'education',
    categoryName: 'Education',
    shortDesc: 'Provides full interest subsidy during the moratorium period on education loans taken by students from Economically Weaker Sections.',
    benefits: [
      '100% interest waiver during the moratorium period (Course duration + 1 year)',
      'Applicable on educational loans up to ₹10 Lakhs taken from scheduled commercial banks under IBA scheme'
    ],
    eligibility: [
      'Students from Economically Weaker Sections with annual parental gross income up to ₹4.5 Lakhs',
      'Enrolled in recognized professional/technical courses in India after Class 12'
    ],
    documents: ['Income Certificate issued by designated State Authority', 'Admission Letter', 'Loan Sanction Letter'],
    howToApply: 'Apply through Vidya Lakshmi Portal (vidyalakshmi.co.in) while applying for student education loan.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/csis'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Schemes' },
  { id: 'bfsi', label: 'Banking & Insurance' },
  { id: 'business', label: 'Business & MSME' },
  { id: 'social', label: 'Pension & Social Security' },
  { id: 'housing', label: 'Housing' },
  { id: 'women', label: 'Women & Child' },
  { id: 'agri', label: 'Agriculture & Rural' },
  { id: 'education', label: 'Education' }
];

const SchemesPage = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalScheme, setActiveModalScheme] = useState(null);

  const filteredSchemes = useMemo(() => {
    return MYSCHEME_DATA.filter((scheme) => {
      const matchCat = selectedCategory === 'all' || scheme.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        scheme.title.toLowerCase().includes(q) ||
        scheme.shortDesc.toLowerCase().includes(q) ||
        scheme.categoryName.toLowerCase().includes(q) ||
        scheme.ministry.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="schemes-page-container">
      {/* Header */}
      <div className="schemes-header">
        <div className="schemes-badge">
          🇮🇳 Government of India • myScheme Citizen Service
        </div>
        <h1>{t('schemes_title', 'Government of India Schemes Portal')}</h1>
        <p>{t('schemes_subtitle', 'Authentic sovereign schemes from myScheme (myscheme.gov.in) categorized for common citizens')}</p>
      </div>

      {/* Official Banner */}
      <div className="myscheme-banner">
        <div className="myscheme-banner-left">
          <span className="myscheme-logo-emblem">🏛️</span>
          <div className="myscheme-banner-text">
            <h3>Powered by Government of India myScheme Platform</h3>
            <p>One-stop search and discovery platform for Central and State Government schemes across India.</p>
          </div>
        </div>
        <a
          href="https://www.myscheme.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="myscheme-portal-link"
        >
          Open myScheme.gov.in ↗
        </a>
      </div>

      {/* Search and Filters */}
      <div className="schemes-controls">
        <div className="schemes-search-bar">
          <span className="schemes-search-icon">🔍</span>
          <input
            type="text"
            placeholder={t('schemes_search_placeholder', 'Search schemes by keyword (e.g. pension, housing, farmer, business, women)...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="schemes-categories-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`scheme-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="schemes-grid">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="scheme-card">
            <div>
              <div className="scheme-card-header">
                <div>
                  <h3 className="scheme-card-title">{scheme.title}</h3>
                  <p className="scheme-card-ministry">{scheme.ministry}</p>
                </div>
                <span className={`scheme-tag ${scheme.category}`}>
                  {scheme.categoryName}
                </span>
              </div>

              <p className="scheme-card-desc">{scheme.shortDesc}</p>

              <div className="scheme-highlights">
                <div className="scheme-hl-row">
                  <span className="scheme-hl-label">Key Benefit:</span>
                  <span className="scheme-hl-value">{scheme.benefits[0]}</span>
                </div>
                <div className="scheme-hl-row">
                  <span className="scheme-hl-label">Target:</span>
                  <span className="scheme-hl-value">{scheme.eligibility[0]}</span>
                </div>
              </div>
            </div>

            <div className="scheme-card-footer">
              <button
                className="scheme-btn-details"
                onClick={() => setActiveModalScheme(scheme)}
              >
                {t('view_details', 'View Full Details')}
              </button>

              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="scheme-btn-external"
              >
                myScheme ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeModalScheme && (
        <div className="scheme-modal-overlay" onClick={() => setActiveModalScheme(null)}>
          <div className="scheme-modal" onClick={(e) => e.stopPropagation()}>
            <div className="scheme-modal-header">
              <div>
                <span className={`scheme-tag ${activeModalScheme.category}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                  {activeModalScheme.categoryName}
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#800020' }}>
                  {activeModalScheme.title}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {activeModalScheme.ministry}
                </p>
              </div>
              <button
                onClick={() => setActiveModalScheme(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="scheme-modal-body">
              <div className="scheme-modal-section">
                <h4>📋 Overview</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
                  {activeModalScheme.shortDesc}
                </p>
              </div>

              <div className="scheme-modal-section">
                <h4>🎯 Benefits Provided</h4>
                <ul>
                  {activeModalScheme.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="scheme-modal-section">
                <h4>👥 Eligibility Criteria</h4>
                <ul>
                  {activeModalScheme.eligibility.map((el, i) => (
                    <li key={i}>{el}</li>
                  ))}
                </ul>
              </div>

              <div className="scheme-modal-section">
                <h4>📑 Required Documents</h4>
                <ul>
                  {activeModalScheme.documents.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="scheme-modal-section">
                <h4>🚀 How to Apply</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
                  {activeModalScheme.howToApply}
                </p>
              </div>
            </div>

            <div className="scheme-modal-footer">
              <button
                onClick={() => setActiveModalScheme(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Close
              </button>

              <a
                href={activeModalScheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#800020',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Apply via myScheme.gov.in ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemesPage;
