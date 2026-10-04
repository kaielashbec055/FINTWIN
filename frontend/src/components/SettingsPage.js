import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Account State
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      occupation: 'Software Engineer',
      monthlyIncome: '120000',
      primaryBank: 'State Bank of India',
      city: 'Bengaluru, Karnataka'
    };
  });

  // Appearance State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fintwin_theme') || 'light';
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emiAlerts: true,
    schemeUpdates: true,
    portfolioDigest: false,
    securityAlerts: true
  });

  // Security Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('fintwin_theme', theme);
  }, [theme]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('user_profile', JSON.stringify(profile));
    setSaveSuccessMessage('Profile information saved successfully!');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setSaveSuccessMessage(`Language updated to ${supportedLanguages.find(l => l.code === langCode)?.name}!`);
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    setSaveSuccessMessage('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of FinTwin?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin');
    }
  };

  return (
    <div className="settings-page-container">
      {/* Header */}
      <div className="settings-header">
        <h1>{t('settings_title', 'Account & System Settings')}</h1>
        <p>{t('settings_subtitle', 'Manage your personal profile, regional language, security, and appearance')}</p>
      </div>

      {saveSuccessMessage && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: 600,
          fontSize: '14px',
          border: '1px solid #86efac'
        }}>
          ✓ {saveSuccessMessage}
        </div>
      )}

      {/* Settings Grid Layout */}
      <div className="settings-layout">
        {/* Navigation Sidebar */}
        <div className="settings-nav">
          <button
            className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span>👤</span>
            <span>{t('settings_tab_account', 'Account Profile')}</span>
          </button>

          <button
            className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <span>🎨</span>
            <span>{t('settings_tab_appearance', 'Appearance')}</span>
          </button>

          <button
            className={`settings-nav-item ${activeTab === 'language' ? 'active' : ''}`}
            onClick={() => setActiveTab('language')}
          >
            <span>🌐</span>
            <span>{t('settings_tab_language', 'Language')}</span>
          </button>

          <button
            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span>🔔</span>
            <span>{t('settings_tab_notifications', 'Notifications')}</span>
          </button>

          <button
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span>🔒</span>
            <span>{t('settings_tab_security', 'Security & Access')}</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="settings-content-card">
          {/* TAB 1: Account Profile */}
          {activeTab === 'account' && (
            <div>
              <h2 className="settings-section-title">Personal Financial Profile</h2>
              <p className="settings-section-sub">
                Your personal and demographic financial information used by FinTwin AI to evaluate eligibility.
              </p>

              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label>{t('settings_full_name', 'Full Name')}</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>{t('settings_email', 'Email Address')}</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label>{t('settings_phone', 'Phone Number')}</label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>City & State</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label>{t('settings_occupation', 'Occupation')}</label>
                    <input
                      type="text"
                      name="occupation"
                      value={profile.occupation}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Monthly In-hand Income (₹)</label>
                    <input
                      type="number"
                      name="monthlyIncome"
                      value={profile.monthlyIncome}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label>Primary Banking Institution</label>
                  <select
                    name="primaryBank"
                    value={profile.primaryBank}
                    onChange={handleProfileChange}
                  >
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="IDBI Bank">IDBI Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                </div>

                <button type="submit" className="settings-btn-save">
                  {t('save', 'Save Changes')}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Appearance */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="settings-section-title">Theme & Appearance</h2>
              <p className="settings-section-sub">
                Customize how FinTwin looks on your device.
              </p>

              <div className="settings-theme-options">
                <div
                  className={`settings-theme-box ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <span style={{ fontSize: '32px' }}>☀️</span>
                  <strong style={{ fontSize: '15px', color: '#1e293b' }}>
                    {t('settings_light_mode', 'Light Theme')}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Clean and vibrant aesthetic</span>
                </div>

                <div
                  className={`settings-theme-box ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <span style={{ fontSize: '32px' }}>🌙</span>
                  <strong style={{ fontSize: '15px', color: '#1e293b' }}>
                    {t('settings_dark_mode', 'Dark Theme')}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Deep slate for night usage</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  <strong>Accent Color:</strong> Deep Maroon (`#800020`) & FinTwin Teal are calibrated for high accessibility compliance across all displays.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Language */}
          {activeTab === 'language' && (
            <div>
              <h2 className="settings-section-title">{t('settings_select_language', 'Select Application Language')}</h2>
              <p className="settings-section-sub">
                Choose your preferred regional language. FinTwin dynamically translates dashboard navigation, loan tools, AI chat prompts, and financial summaries.
              </p>

              <div className="settings-lang-grid">
                {supportedLanguages.map((lang) => (
                  <div
                    key={lang.code}
                    className={`settings-lang-card ${language === lang.code ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <div className="settings-lang-native">{lang.native}</div>
                    <div className="settings-lang-english">{lang.name}</div>
                    {language === lang.code && (
                      <span style={{ fontSize: '11px', color: '#800020', fontWeight: 700, marginTop: '6px', display: 'inline-block' }}>
                        ✓ Active
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '28px', padding: '18px', background: '#f8fafc', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#1e293b' }}>Live Preview ({language.toUpperCase()}):</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#800020', fontWeight: 600 }}>
                  "{t('dash_welcome_back')}, {profile.fullName}! {t('dash_total_balance')} - {t('dash_recent_transactions')}"
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="settings-section-title">Notification Preferences</h2>
              <p className="settings-section-sub">
                Manage notifications for monthly EMIs, market dividends, and government scheme registration deadlines.
              </p>

              <div className="settings-toggle-list">
                <div className="settings-toggle-item">
                  <div className="settings-toggle-text">
                    <h4>Monthly Loan EMI Reminders</h4>
                    <p>Receive notifications 3 days before upcoming bank loan EMI debits</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.emiAlerts}
                      onChange={(e) => setNotifications({ ...notifications, emiAlerts: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-text">
                    <h4>Government Scheme Eligibility & Deadlines</h4>
                    <p>Get notified when you qualify for newly launched Central or State subsidy schemes</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.schemeUpdates}
                      onChange={(e) => setNotifications({ ...notifications, schemeUpdates: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-text">
                    <h4>Weekly Portfolio & Market Digest</h4>
                    <p>Receive summary of stock gains, mutual fund NAVs, and sovereign bond returns</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.portfolioDigest}
                      onChange={(e) => setNotifications({ ...notifications, portfolioDigest: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-text">
                    <h4>Security & Login Activity Alerts</h4>
                    <p>Instant SMS and Email notification on new device log-in</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.securityAlerts}
                      onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Security */}
          {activeTab === 'security' && (
            <div>
              <h2 className="settings-section-title">Security & Session Management</h2>
              <p className="settings-section-sub">
                Manage your master FinTwin credentials and account security.
              </p>

              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <div className="settings-form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="settings-btn-save">
                  {t('settings_change_password', 'Update Password')}
                </button>
              </form>

              <div className="settings-danger-zone">
                <h4 style={{ margin: '0 0 6px 0', color: '#b91c1c' }}>Session Termination</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
                  Sign out of all sessions and return to the login screen.
                </p>
                <button type="button" className="settings-btn-danger" onClick={handleLogout}>
                  {t('settings_logout', 'Sign Out of FinTwin')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
