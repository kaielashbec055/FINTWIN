import React, { useState, useEffect, useMemo } from 'react';
import './InvestmentsPage.css';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_INVESTMENTS = [
  {
    id: 'inv-1',
    name: 'UTI Nifty 50 Index Fund (Direct Growth)',
    category: 'mutual_funds',
    institution: 'Zerodha Coin',
    investedAmount: 350000,
    currentValue: 432000,
    cagr: 13.8,
    risk: 'moderate',
    date: '2023-01-15'
  },
  {
    id: 'inv-2',
    name: 'SBI Tax Saver Fixed Deposit (5 Years)',
    category: 'fixed_deposits',
    institution: 'State Bank of India',
    investedAmount: 200000,
    currentValue: 236400,
    cagr: 7.1,
    risk: 'low',
    date: '2022-08-10'
  },
  {
    id: 'inv-3',
    name: 'Sovereign Gold Bond (SGB 2023-24 Series II)',
    category: 'gold',
    institution: 'RBI / Zerodha',
    investedAmount: 125000,
    currentValue: 168000,
    cagr: 16.2,
    risk: 'low',
    date: '2023-09-20'
  },
  {
    id: 'inv-4',
    name: 'Tata Consultancy Services (TCS)',
    category: 'stocks',
    institution: 'Groww',
    investedAmount: 180000,
    currentValue: 215000,
    cagr: 9.7,
    risk: 'moderate',
    date: '2023-04-12'
  },
  {
    id: 'inv-5',
    name: 'Bharat Bond ETF April 2030 (AAA PSU)',
    category: 'bonds',
    institution: 'ICICI Direct',
    investedAmount: 150000,
    currentValue: 168200,
    cagr: 7.4,
    risk: 'low',
    date: '2022-11-05'
  },
  {
    id: 'inv-6',
    name: 'Parag Parikh Flexi Cap Fund (Growth)',
    category: 'mutual_funds',
    institution: 'Groww',
    investedAmount: 280000,
    currentValue: 364000,
    cagr: 18.5,
    risk: 'moderate',
    date: '2022-05-18'
  }
];

const CATEGORY_COLORS = {
  mutual_funds: '#3b82f6',
  stocks: '#6366f1',
  fixed_deposits: '#22c55e',
  gold: '#f59e0b',
  bonds: '#a855f7',
  etfs: '#f97316',
  other: '#64748b'
};

const InvestmentsPage = () => {
  const { t } = useLanguage();

  const [investments, setInvestments] = useState(() => {
    try {
      const saved = localStorage.getItem('fintwin_investments');
      return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
    } catch {
      return INITIAL_INVESTMENTS;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');

  // Form State for new investment
  const [formData, setFormData] = useState({
    name: '',
    category: 'mutual_funds',
    institution: '',
    investedAmount: '',
    currentValue: '',
    cagr: '',
    risk: 'low',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    try {
      localStorage.setItem('fintwin_investments', JSON.stringify(investments));
    } catch (e) {
      console.error('Failed to save investments', e);
    }
  }, [investments]);

  // Calculations
  const metrics = useMemo(() => {
    const totalInvested = investments.reduce((acc, item) => acc + (Number(item.investedAmount) || 0), 0);
    const totalCurrent = investments.reduce((acc, item) => acc + (Number(item.currentValue) || 0), 0);
    const totalGain = totalCurrent - totalInvested;
    const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

    return {
      totalInvested,
      totalCurrent,
      totalGain,
      gainPercent
    };
  }, [investments]);

  // Allocation distribution
  const allocation = useMemo(() => {
    if (metrics.totalCurrent === 0) return [];
    const grouped = {};
    investments.forEach((inv) => {
      const cat = inv.category || 'other';
      grouped[cat] = (grouped[cat] || 0) + (Number(inv.currentValue) || 0);
    });

    return Object.entries(grouped).map(([category, value]) => ({
      category,
      value,
      percent: ((value / metrics.totalCurrent) * 100).toFixed(1),
      color: CATEGORY_COLORS[category] || '#64748b'
    })).sort((a, b) => b.value - a.value);
  }, [investments, metrics.totalCurrent]);

  // Filtered investments
  const filteredInvestments = useMemo(() => {
    return investments.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [investments, selectedCategory, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.investedAmount) return;

    const invested = parseFloat(formData.investedAmount);
    const current = formData.currentValue ? parseFloat(formData.currentValue) : invested;

    const newInv = {
      id: `inv-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      institution: formData.institution || 'Direct',
      investedAmount: invested,
      currentValue: current,
      cagr: formData.cagr ? parseFloat(formData.cagr) : 8.5,
      risk: formData.risk,
      date: formData.date || new Date().toISOString().split('T')[0]
    };

    setInvestments((prev) => [newInv, ...prev]);
    setShowAddModal(false);
    setFormData({
      name: '',
      category: 'mutual_funds',
      institution: '',
      investedAmount: '',
      currentValue: '',
      cagr: '',
      risk: 'low',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this investment from your portfolio?')) {
      setInvestments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAddFundsSubmit = (e) => {
    e.preventDefault();
    if (!showAddFundsModal || !addFundsAmount || parseFloat(addFundsAmount) <= 0) return;
    const additional = parseFloat(addFundsAmount);

    setInvestments((prev) =>
      prev.map((item) => {
        if (item.id === showAddFundsModal.id) {
          return {
            ...item,
            investedAmount: Number(item.investedAmount) + additional,
            currentValue: Number(item.currentValue) + additional
          };
        }
        return item;
      })
    );

    setShowAddFundsModal(null);
    setAddFundsAmount('');
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'mutual_funds': return 'Mutual Fund';
      case 'stocks': return 'Stock / Equity';
      case 'fixed_deposits': return 'Fixed Deposit';
      case 'gold': return 'Gold / SGB';
      case 'bonds': return 'Govt / PSU Bond';
      case 'etfs': return 'ETF';
      default: return 'Other Asset';
    }
  };

  return (
    <div className="inv-page-container">
      {/* Header */}
      <div className="inv-header">
        <div className="inv-header-titles">
          <h1>{t('inv_title', 'Investment Portfolio')}</h1>
          <p>{t('inv_subtitle', 'Track equity, mutual funds, fixed deposits, gold, and sovereign bonds in one place')}</p>
        </div>
        <div className="inv-header-actions">
          <button className="inv-btn-primary" onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t('inv_add_investment', 'Add Investment')}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="inv-metrics-grid">
        <div className="inv-metric-card">
          <div className="inv-metric-label">{t('inv_total_invested', 'Total Invested')}</div>
          <div className="inv-metric-value">{formatCurrency(metrics.totalInvested)}</div>
          <div className="inv-metric-badge" style={{ color: '#64748b' }}>
            {investments.length} Active Holdings
          </div>
        </div>

        <div className="inv-metric-card">
          <div className="inv-metric-label">{t('inv_current_value', 'Current Value')}</div>
          <div className="inv-metric-value" style={{ color: '#800020' }}>
            {formatCurrency(metrics.totalCurrent)}
          </div>
          <div className="inv-metric-badge positive">
            Market Evaluated
          </div>
        </div>

        <div className="inv-metric-card">
          <div className="inv-metric-label">{t('inv_total_returns', 'Total Returns')}</div>
          <div className="inv-metric-value">
            {metrics.totalGain >= 0 ? '+' : ''}{formatCurrency(metrics.totalGain)}
          </div>
          <div className={`inv-metric-badge ${metrics.totalGain >= 0 ? 'positive' : 'negative'}`}>
            {metrics.totalGain >= 0 ? '▲' : '▼'} {metrics.gainPercent}% Overall Gain
          </div>
        </div>

        <div className="inv-metric-card">
          <div className="inv-metric-label">Leading Asset Class</div>
          <div className="inv-metric-value" style={{ fontSize: '18px', textTransform: 'capitalize' }}>
            {allocation[0] ? getCategoryLabel(allocation[0].category) : 'None'}
          </div>
          <div className="inv-metric-badge" style={{ color: '#64748b' }}>
            {allocation[0] ? `${allocation[0].percent}% of Portfolio` : 'No data'}
          </div>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      {allocation.length > 0 && (
        <div className="inv-allocation-box">
          <div className="inv-allocation-header">
            <span className="inv-allocation-title">Asset Class Diversification</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Live Distribution</span>
          </div>

          <div className="inv-bar-stacked">
            {allocation.map((item) => (
              <div
                key={item.category}
                className="inv-bar-segment"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.color
                }}
                title={`${getCategoryLabel(item.category)}: ${item.percent}%`}
              />
            ))}
          </div>

          <div className="inv-legend-grid">
            {allocation.map((item) => (
              <div key={item.category} className="inv-legend-item">
                <span className="inv-legend-dot" style={{ backgroundColor: item.color }} />
                <span>{getCategoryLabel(item.category)}</span>
                <strong style={{ color: '#1e293b' }}>{item.percent}%</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="inv-toolbar">
        <div className="inv-tabs">
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'mutual_funds', label: 'Mutual Funds' },
            { id: 'stocks', label: 'Stocks' },
            { id: 'fixed_deposits', label: 'Fixed Deposits' },
            { id: 'gold', label: 'Gold / SGB' },
            { id: 'bonds', label: 'Bonds' },
            { id: 'etfs', label: 'ETFs' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`inv-tab-btn ${selectedCategory === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="inv-search-box">
          <span className="inv-search-icon">🔍</span>
          <input
            type="text"
            className="inv-search-input"
            placeholder="Search holdings, broker, bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Holdings Grid */}
      {filteredInvestments.length === 0 ? (
        <div className="inv-empty">
          <p>No investments found matching your filters.</p>
          <button className="inv-btn-primary" onClick={() => setShowAddModal(true)}>
            + Add First Holding
          </button>
        </div>
      ) : (
        <div className="inv-grid">
          {filteredInvestments.map((inv) => {
            const gain = Number(inv.currentValue) - Number(inv.investedAmount);
            const gainPct = inv.investedAmount > 0 ? ((gain / Number(inv.investedAmount)) * 100).toFixed(1) : 0;
            const isProfit = gain >= 0;

            return (
              <div key={inv.id} className="inv-card">
                <div>
                  <div className="inv-card-top">
                    <div>
                      <h3 className="inv-card-title">{inv.name}</h3>
                      <p className="inv-card-institution">{inv.institution || 'Direct / Bank'}</p>
                    </div>
                    <span className={`inv-tag ${inv.category}`}>
                      {getCategoryLabel(inv.category)}
                    </span>
                  </div>

                  <div className="inv-financials">
                    <div className="inv-fin-item">
                      <label>{t('inv_total_invested', 'Invested')}</label>
                      <span>{formatCurrency(inv.investedAmount)}</span>
                    </div>
                    <div className="inv-fin-item">
                      <label>{t('inv_current_value', 'Current Value')}</label>
                      <span style={{ color: '#800020' }}>{formatCurrency(inv.currentValue)}</span>
                    </div>
                  </div>

                  <div className="inv-growth-row">
                    <span className={`inv-gain-val ${isProfit ? 'positive' : 'negative'}`}>
                      {isProfit ? '▲ +' : '▼ '}{formatCurrency(gain)} ({gainPct}%)
                    </span>
                    <span className={`inv-risk-badge inv-risk-${inv.risk || 'low'}`}>
                      {inv.risk ? `${inv.risk.toUpperCase()} RISK` : 'MODERATE RISK'}
                    </span>
                  </div>
                </div>

                <div className="inv-card-footer">
                  <span>Since {inv.date || '2023'}</span>
                  <div className="inv-card-actions">
                    <button
                      className="inv-action-btn"
                      onClick={() => setShowAddFundsModal(inv)}
                      title="Add funds / Top up"
                    >
                      + Add Funds
                    </button>
                    <button
                      className="inv-action-btn delete"
                      onClick={() => handleDelete(inv.id)}
                      title="Remove holding"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="inv-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h2>{t('inv_add_investment', 'Add New Investment')}</h2>
              <button className="inv-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="inv-modal-form">
              <div className="inv-form-group">
                <label>Instrument / Asset Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Parag Parikh Flexi Cap Fund / Reliance Industries"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label>Asset Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="mutual_funds">Mutual Funds</option>
                    <option value="stocks">Stocks / Equity</option>
                    <option value="fixed_deposits">Fixed Deposit (FD)</option>
                    <option value="gold">Sovereign Gold / Digital Gold</option>
                    <option value="bonds">Govt / Corporate Bonds</option>
                    <option value="etfs">Exchange Traded Funds (ETFs)</option>
                    <option value="other">Other Assets</option>
                  </select>
                </div>

                <div className="inv-form-group">
                  <label>Broker / Bank / Platform</label>
                  <input
                    type="text"
                    name="institution"
                    placeholder="e.g. Zerodha, Groww, SBI, HDFC"
                    value={formData.institution}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label>Invested Principal (₹) *</label>
                  <input
                    type="number"
                    name="investedAmount"
                    placeholder="e.g. 50000"
                    value={formData.investedAmount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="inv-form-group">
                  <label>Current Valuation (₹)</label>
                  <input
                    type="number"
                    name="currentValue"
                    placeholder="e.g. 58000 (Defaults to invested)"
                    value={formData.currentValue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label>Expected Return / CAGR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="cagr"
                    placeholder="e.g. 12.5"
                    value={formData.cagr}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="inv-form-group">
                  <label>Risk Profile</label>
                  <select name="risk" value={formData.risk} onChange={handleInputChange}>
                    <option value="low">Low Risk (FDs, Sovereign Gold, Govt Bonds)</option>
                    <option value="moderate">Moderate Risk (Index Funds, Large Caps)</option>
                    <option value="high">High Risk (Mid/Small Caps, Direct Equities)</option>
                  </select>
                </div>
              </div>

              <div className="inv-form-group">
                <label>Investment Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="inv-modal-actions">
                <button type="button" className="inv-btn-secondary" onClick={() => setShowAddModal(false)}>
                  {t('cancel', 'Cancel')}
                </button>
                <button type="submit" className="inv-btn-primary">
                  {t('save', 'Save Investment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds / Top Up Modal */}
      {showAddFundsModal && (
        <div className="inv-modal-overlay" onClick={() => setShowAddFundsModal(null)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="inv-modal-header">
              <h2>Add Capital to {showAddFundsModal.name}</h2>
              <button className="inv-modal-close" onClick={() => setShowAddFundsModal(null)}>✕</button>
            </div>

            <form onSubmit={handleAddFundsSubmit} className="inv-modal-form">
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Current Invested: {formatCurrency(showAddFundsModal.investedAmount)} | Current Value: {formatCurrency(showAddFundsModal.currentValue)}
              </p>

              <div className="inv-form-group">
                <label>Top-up Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="inv-modal-actions">
                <button type="button" className="inv-btn-secondary" onClick={() => setShowAddFundsModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="inv-btn-primary">
                  Confirm Top-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;
