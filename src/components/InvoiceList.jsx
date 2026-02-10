import { useState } from 'react';

function InvoiceList({ invoices, onDownloadPDF, onDelete, onStatusChange, loading }) {
    const [changingStatus, setChangingStatus] = useState(null);

    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'warning' },
        { value: 'paid', label: 'Paid', color: 'success' },
        { value: 'overdue', label: 'Overdue', color: 'danger' },
        { value: 'cancelled', label: 'Cancelled', color: 'gray' },
    ];

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'paid': return 'badge--paid';
            case 'overdue': return 'badge--overdue';
            case 'cancelled': return 'badge--cancelled';
            default: return 'badge--pending';
        }
    };

    const handleStatusChange = async (invoiceId, newStatus) => {
        setChangingStatus(invoiceId);
        await onStatusChange(invoiceId, newStatus);
        setChangingStatus(null);
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card__body" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                </div>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="card animate-fadeIn">
                <div className="empty-state">
                    <div className="empty-state__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="empty-state__title">No Invoices Yet</h3>
                    <p className="empty-state__text">Create your first invoice to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card animate-fadeIn">
            <div className="card__header">
                <h3 className="card__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--primary-500)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Invoice List
                </h3>
                <span className="badge badge--pending">{invoices.length} Total</span>
            </div>

            <div className="card__body">
                <div className="invoice-list">
                    {invoices.map((invoice) => (
                        <div key={invoice.id} className="invoice-item">
                            <div className="invoice-item__info">
                                <div className="invoice-item__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="invoice-item__details">
                                    <h4>{invoice.invoiceNumber}</h4>
                                    <p>{invoice.clientName}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                        Created: {new Date(invoice.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Status Dropdown */}
                            <div className="status-dropdown">
                                <select
                                    className={`status-select status-select--${invoice.status}`}
                                    value={invoice.status}
                                    onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                    disabled={changingStatus === invoice.id}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {changingStatus === invoice.id && (
                                    <div className="status-loading">
                                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                    </div>
                                )}
                            </div>

                            <span className="invoice-item__amount">
                                {invoice.total.toFixed(2)} DH
                            </span>

                            <div className="invoice-item__actions">
                                <button
                                    className="btn btn--success btn--sm"
                                    onClick={() => onDownloadPDF(invoice.id)}
                                    title="Download PDF"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    PDF
                                </button>

                                <button
                                    className="btn btn--danger btn--sm"
                                    onClick={() => onDelete(invoice.id)}
                                    title="Delete Invoice"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InvoiceList;
