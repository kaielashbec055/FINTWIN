import React, { useState, useEffect, useMemo } from 'react';
import './GoalsPage.css';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_GOALS = [
  {
    id: 'goal-1',
    title: 'Emergency Fund (6 Months Expenses)',
    category: 'Safety Net',
    targetAmount: 300000,
    savedAmount: 240000,
    monthlyContribution: 15000,
    targetDate: '2026-12-31',
    status: 'on_track'
  },
  {
    id: 'goal-2',
    title: 'Home Loan Down Payment (20%)',
    category: 'Real Estate',
    targetAmount: 2500000,
    savedAmount: 1150000,
    monthlyContribution: 35000,
    targetDate: '2028-06-30',
    status: 'on_track'
  },
  {
    id: 'goal-3',
    title: 'Children Higher Education Fund',
    category: 'Education',
    targetAmount: 1200000,
    savedAmount: 420000,
    monthlyContribution: 12000,
    targetDate: '2027-08-31',
    status: 'needs_attention'
  },
  {
    id: 'goal-4',
    title: 'Electric Vehicle (EV) Purchase',
    category: 'Vehicle',
    targetAmount: 800000,
    savedAmount: 550000,
    monthlyContribution: 20000,
    targetDate: '2026-10-31',
    status: 'on_track'
  },
  {
    id: 'goal-5',
    title: 'Annual Family Vacation',
    category: 'Lifestyle',
    targetAmount: 250000,
    savedAmount: 180000,
    monthlyContribution: 10000,
    targetDate: '2026-12-15',
    status: 'on_track'
  }
];

const GoalsPage = () => {
  const { t } = useLanguage();

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('fintwin_goals');
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(null);
  const [fundsAmount, setFundsAmount] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Safety Net',
    targetAmount: '',
    savedAmount: '',
    monthlyContribution: '',
    targetDate: ''
  });

  useEffect(() => {
    try {
      localStorage.setItem('fintwin_goals', JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }, [goals]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
    const totalSaved = goals.reduce((acc, g) => acc + (Number(g.savedAmount) || 0), 0);
    const totalMonthly = goals.reduce((acc, g) => acc + (Number(g.monthlyContribution) || 0), 0);
    const avgProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

    return {
      totalTarget,
      totalSaved,
      totalMonthly,
      avgProgress
    };
  }, [goals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddGoalSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetAmount) return;

    const target = parseFloat(formData.targetAmount);
    const saved = formData.savedAmount ? parseFloat(formData.savedAmount) : 0;
    const monthly = formData.monthlyContribution ? parseFloat(formData.monthlyContribution) : 0;

    const newGoal = {
      id: `goal-${Date.now()}`,
      title: formData.title,
      category: formData.category || 'General',
      targetAmount: target,
      savedAmount: saved,
      monthlyContribution: monthly,
      targetDate: formData.targetDate || '2027-12-31',
      status: (saved / target) >= 0.3 ? 'on_track' : 'needs_attention'
    };

    setGoals((prev) => [newGoal, ...prev]);
    setShowAddModal(false);
    setFormData({
      title: '',
      category: 'Safety Net',
      targetAmount: '',
      savedAmount: '',
      monthlyContribution: '',
      targetDate: ''
    });
  };

  const handleAddFundsSubmit = (e) => {
    e.preventDefault();
    if (!showAddFundsModal || !fundsAmount || parseFloat(fundsAmount) <= 0) return;

    const extra = parseFloat(fundsAmount);
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === showAddFundsModal.id) {
          const newSaved = Number(g.savedAmount) + extra;
          return {
            ...g,
            savedAmount: newSaved,
            status: (newSaved / g.targetAmount) >= 0.4 ? 'on_track' : g.status
          };
        }
        return g;
      })
    );

    setShowAddFundsModal(null);
    setFundsAmount('');
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this financial goal?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  return (
    <div className="goals-page-container">
      {/* Header */}
      <div className="goals-header">
        <div className="goals-header-titles">
          <h1>{t('goals_title', 'Financial Goals')}</h1>
          <p>{t('goals_subtitle', 'Define, track, and achieve your milestone financial targets')}</p>
        </div>
        <button className="goals-btn-primary" onClick={() => setShowAddModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {t('goals_add_goal', 'Add Goal')}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="goals-metrics-grid">
        <div className="goals-metric-card">
          <div className="goals-metric-label">{t('goals_total_targets', 'Total Target Value')}</div>
          <div className="goals-metric-value">{formatCurrency(metrics.totalTarget)}</div>
          <div className="goals-metric-sub" style={{ color: '#64748b' }}>
            {goals.length} Strategic Goals Active
          </div>
        </div>

        <div className="goals-metric-card">
          <div className="goals-metric-label">{t('goals_total_saved', 'Total Saved So Far')}</div>
          <div className="goals-metric-value" style={{ color: '#800020' }}>
            {formatCurrency(metrics.totalSaved)}
          </div>
          <div className="goals-metric-sub">
            {metrics.avgProgress}% Aggregate Completion
          </div>
        </div>

        <div className="goals-metric-card">
          <div className="goals-metric-label">{t('goals_monthly_savings', 'Monthly Commitments')}</div>
          <div className="goals-metric-value">
            {formatCurrency(metrics.totalMonthly)}
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}> /mo</span>
          </div>
          <div className="goals-metric-sub">
            Systematic Inflows
          </div>
        </div>

        <div className="goals-metric-card">
          <div className="goals-metric-label">Goals On Track</div>
          <div className="goals-metric-value" style={{ color: '#16a34a' }}>
            {goals.filter((g) => g.status === 'on_track').length} / {goals.length}
          </div>
          <div className="goals-metric-sub">
            High Velocity
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {goals.map((goal) => {
          const pct = Math.min(100, ((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100) || 0).toFixed(0);
          const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.savedAmount));

          return (
            <div key={goal.id} className="goal-card">
              <div>
                <div className="goal-card-top">
                  <div>
                    <h3 className="goal-card-title">{goal.title}</h3>
                    <p className="goal-card-cat">{goal.category}</p>
                  </div>
                  <span className={`goal-status-badge ${goal.status}`}>
                    {goal.status === 'on_track' ? t('goals_on_track', 'On Track') : t('goals_needs_attention', 'Needs Attention')}
                  </span>
                </div>

                <div className="goal-progress-box">
                  <div className="goal-progress-header">
                    <span className="goal-saved-amt">{formatCurrency(goal.savedAmount)}</span>
                    <span className="goal-target-amt">of {formatCurrency(goal.targetAmount)} ({pct}%)</span>
                  </div>

                  <div className="goal-progress-track">
                    <div
                      className={`goal-progress-bar ${pct >= 100 ? 'complete' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="goal-stats-row">
                  <div className="goal-stat-item">
                    <label>{t('goals_remaining', 'Remaining')}</label>
                    <span>{formatCurrency(remaining)}</span>
                  </div>
                  <div className="goal-stat-item">
                    <label>Monthly SIP</label>
                    <span>{formatCurrency(goal.monthlyContribution)}</span>
                  </div>
                  <div className="goal-stat-item">
                    <label>{t('goals_target_date', 'Target Date')}</label>
                    <span>{goal.targetDate || '2027'}</span>
                  </div>
                  <div className="goal-stat-item">
                    <label>Est. Months Left</label>
                    <span>
                      {goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : '—'} mos
                    </span>
                  </div>
                </div>
              </div>

              <div className="goal-card-footer">
                <button
                  className="goal-btn-addfunds"
                  onClick={() => setShowAddFundsModal(goal)}
                >
                  + {t('goals_add_funds', 'Add Funds')}
                </button>
                <button
                  className="goal-btn-delete"
                  onClick={() => handleDeleteGoal(goal.id)}
                  title="Delete goal"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="goal-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-header">
              <h2>{t('goals_add_goal', 'Add Financial Goal')}</h2>
              <button className="goal-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="goal-modal-form">
              <div className="goal-form-group">
                <label>Goal Objective / Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Higher Education / Car Purchase / Home"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="goal-form-group">
                <label>Goal Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Safety Net">Emergency & Safety Net</option>
                  <option value="Real Estate">Real Estate & Housing</option>
                  <option value="Education">Higher Education</option>
                  <option value="Vehicle">Vehicle Purchase</option>
                  <option value="Retirement">Retirement Wealth</option>
                  <option value="Lifestyle">Travel & Lifestyle</option>
                </select>
              </div>

              <div className="goal-form-group">
                <label>Target Amount (₹) *</label>
                <input
                  type="number"
                  name="targetAmount"
                  placeholder="e.g. 500000"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="goal-form-group">
                <label>Already Saved Amount (₹)</label>
                <input
                  type="number"
                  name="savedAmount"
                  placeholder="e.g. 50000"
                  value={formData.savedAmount}
                  onChange={handleInputChange}
                />
              </div>

              <div className="goal-form-group">
                <label>Planned Monthly Savings (₹)</label>
                <input
                  type="number"
                  name="monthlyContribution"
                  placeholder="e.g. 15000"
                  value={formData.monthlyContribution}
                  onChange={handleInputChange}
                />
              </div>

              <div className="goal-form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="goal-modal-actions">
                <button type="button" className="goal-btn-secondary" onClick={() => setShowAddModal(false)}>
                  {t('cancel', 'Cancel')}
                </button>
                <button type="submit" className="goals-btn-primary">
                  {t('save', 'Create Goal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="goal-modal-overlay" onClick={() => setShowAddFundsModal(null)}>
          <div className="goal-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="goal-modal-header">
              <h2>Deposit to {showAddFundsModal.title}</h2>
              <button className="goal-modal-close" onClick={() => setShowAddFundsModal(null)}>✕</button>
            </div>

            <form onSubmit={handleAddFundsSubmit} className="goal-modal-form">
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Current Saved: {formatCurrency(showAddFundsModal.savedAmount)} / Target: {formatCurrency(showAddFundsModal.targetAmount)}
              </p>

              <div className="goal-form-group">
                <label>Deposit Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="goal-modal-actions">
                <button type="button" className="goal-btn-secondary" onClick={() => setShowAddFundsModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="goals-btn-primary">
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
