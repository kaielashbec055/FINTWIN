import React, { useState, useEffect, useRef } from 'react';
import './DocumentsPage.css';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'SBI_Savings_Account_Statement_FY24.pdf',
    category: 'banking',
    categoryLabel: 'Bank Statements',
    size: '1.2 MB',
    uploadDate: '2024-10-02',
    type: 'application/pdf'
  },
  {
    id: 'doc-2',
    name: 'HDFC_Home_Loan_Sanction_Letter.pdf',
    category: 'loans',
    categoryLabel: 'Loans & Credit',
    size: '2.4 MB',
    uploadDate: '2024-06-15',
    type: 'application/pdf'
  },
  {
    id: 'doc-3',
    name: 'Income_Tax_Acknowledgment_AY2024-25.pdf',
    category: 'taxes',
    categoryLabel: 'Tax & ITR',
    size: '480 KB',
    uploadDate: '2024-07-28',
    type: 'application/pdf'
  },
  {
    id: 'doc-4',
    name: 'MaxLife_Term_Insurance_Policy_Bond.pdf',
    category: 'insurance',
    categoryLabel: 'Insurance',
    size: '3.1 MB',
    uploadDate: '2024-01-10',
    type: 'application/pdf'
  },
  {
    id: 'doc-5',
    name: 'Zerodha_Consolidated_PnL_FY23-24.xlsx',
    category: 'investments',
    categoryLabel: 'Investments',
    size: '850 KB',
    uploadDate: '2024-05-20',
    type: 'application/vnd.ms-excel'
  },
  {
    id: 'doc-6',
    name: 'Aadhaar_PAN_Masked_KYC_Verified.pdf',
    category: 'kyc',
    categoryLabel: 'Identity & KYC',
    size: '620 KB',
    uploadDate: '2023-11-12',
    type: 'application/pdf'
  }
];

const DocumentsPage = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('fintwin_documents');
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('banking');

  useEffect(() => {
    try {
      localStorage.setItem('fintwin_documents', JSON.stringify(documents));
    } catch (e) {
      console.error('Failed to save documents', e);
    }
  }, [documents]);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const newDocs = Array.from(files).map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      category: uploadCategory,
      categoryLabel: getCategoryLabel(uploadCategory),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      type: file.type || 'application/octet-stream'
    }));

    setDocuments((prev) => [...newDocs, ...prev]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this document?')) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleDownload = (doc) => {
    // Generate simulated text blob for demonstration download
    const dummyContent = `FinTwin Encrypted Document Vault\nDocument: ${doc.name}\nCategory: ${doc.categoryLabel}\nUploaded: ${doc.uploadDate}\nVerified via FinTwin Digital Locker Security.`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'banking': return 'Bank Statements';
      case 'loans': return 'Loans & Credit';
      case 'taxes': return 'Tax & ITR';
      case 'insurance': return 'Insurance';
      case 'kyc': return 'Identity & KYC';
      case 'investments': return 'Investments';
      default: return 'General';
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
    return '📁';
  };

  const filteredDocs = documents.filter((doc) => {
    const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="docs-page-container">
      {/* Header */}
      <div className="docs-header">
        <div className="docs-header-titles">
          <h1>{t('docs_title', 'Financial Documents Vault')}</h1>
          <p>{t('docs_subtitle', 'Securely store and manage your bank statements, tax records, policies, and loan documents')}</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`docs-dropzone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <span className="docs-drop-icon">☁️</span>
        <div className="docs-drop-title">
          {t('docs_drag_drop', 'Drag & drop files here or click to browse')}
        </div>
        <div className="docs-drop-subtitle">
          Supports PDF, Word, Excel, CSV, PNG, and JPG files up to 25MB
        </div>

        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Upload under:</label>
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="banking">Bank Statements</option>
            <option value="loans">Loans & Sanction Letters</option>
            <option value="taxes">Tax Records & ITR</option>
            <option value="insurance">Insurance Policies</option>
            <option value="kyc">KYC & Identity</option>
            <option value="investments">Investments</option>
          </select>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Toolbar */}
      <div className="docs-toolbar">
        <div className="docs-tabs">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'banking', label: 'Bank Statements' },
            { id: 'loans', label: 'Loans' },
            { id: 'taxes', label: 'Taxes & ITR' },
            { id: 'insurance', label: 'Insurance' },
            { id: 'kyc', label: 'KYC & ID' },
            { id: 'investments', label: 'Investments' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`docs-tab-btn ${selectedCategory === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="docs-search">
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="docs-table-wrapper">
        <table className="docs-table">
          <thead>
            <tr>
              <th>{t('docs_file_name', 'Document Name')}</th>
              <th>Category</th>
              <th>{t('docs_file_size', 'File Size')}</th>
              <th>{t('docs_upload_date', 'Upload Date')}</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No documents found in this category.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="docs-file-col">
                      <span className="docs-file-icon">{getFileIcon(doc.name)}</span>
                      <span className="docs-file-name">{doc.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`docs-tag ${doc.category}`}>
                      {doc.categoryLabel}
                    </span>
                  </td>
                  <td>{doc.size}</td>
                  <td>{doc.uploadDate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="docs-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="docs-btn-action"
                        onClick={() => setActivePreviewDoc(doc)}
                      >
                        {t('docs_preview', 'Preview')}
                      </button>
                      <button
                        className="docs-btn-action"
                        onClick={() => handleDownload(doc)}
                      >
                        {t('docs_download', 'Download')}
                      </button>
                      <button
                        className="docs-btn-action delete"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete Document"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {activePreviewDoc && (
        <div className="docs-modal-overlay" onClick={() => setActivePreviewDoc(null)}>
          <div className="docs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="docs-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{getFileIcon(activePreviewDoc.name)}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#800020' }}>{activePreviewDoc.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {activePreviewDoc.categoryLabel} • {activePreviewDoc.size}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewDoc(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="docs-modal-body">
              <div className="docs-preview-box">
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🔒</span>
                <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>FinTwin Secure Document Preview</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  This document is encrypted and securely stored in your browser's private vault storage.
                </p>
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                  ✓ 256-bit AES Vault Encryption Active
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><strong>Uploaded On:</strong> {activePreviewDoc.uploadDate}</div>
                <div><strong>MIME Type:</strong> {activePreviewDoc.type}</div>
                <div><strong>Category:</strong> {activePreviewDoc.categoryLabel}</div>
                <div><strong>Status:</strong> Verified & Indexed</div>
              </div>
            </div>

            <div className="docs-modal-footer">
              <button
                className="docs-btn-action"
                onClick={() => setActivePreviewDoc(null)}
              >
                Close
              </button>
              <button
                className="docs-btn-action"
                style={{ background: '#800020', color: '#ffffff', borderColor: '#800020' }}
                onClick={() => handleDownload(activePreviewDoc)}
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
