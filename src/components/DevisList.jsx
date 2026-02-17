import { useState } from 'react';

function DevisList({ devisList, onDownloadPDF, onDelete, onStatusChange, onConvertToInvoice, loading }) {
    const [changingStatus, setChangingStatus] = useState(null);
    const [converting, setConverting] = useState(null);

    const statusOptions = [
        { value: 'draft', label: 'Brouillon', color: 'gray' },
        { value: 'sent', label: 'Envoyé', color: 'info' },
        { value: 'accepted', label: 'Accepté', color: 'success' },
        { value: 'rejected', label: 'Refusé', color: 'danger' },
    ];

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'accepted': return 'badge--paid';
            case 'rejected': return 'badge--overdue';
            case 'sent': return 'badge--pending';
            default: return 'badge--cancelled';
        }
    };

    const handleStatusChange = async (devisId, newStatus) => {
        setChangingStatus(devisId);
        await onStatusChange(devisId, newStatus);
        setChangingStatus(null);
    };

    const handleConvert = async (devisId) => {
        if (!window.confirm('Convertir ce devis en facture ? Cette action est irréversible.')) {
            return;
        }
        setConverting(devisId);
        await onConvertToInvoice(devisId);
        setConverting(null);
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

    if (devisList.length === 0) {
        return (
            <div className="card animate-fadeIn">
                <div className="empty-state">
                    <div className="empty-state__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="empty-state__title">Aucun devis pour le moment</h3>
                    <p className="empty-state__text">Créez votre premier devis pour commencer !</p>
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
                    Liste des devis
                </h3>
                <span className="badge badge--pending">{devisList.length} Total</span>
            </div>

            <div className="card__body">
                <div className="invoice-list">
                    {devisList.map((devis) => (
                        <div key={devis.id} className="invoice-item">
                            <div className="invoice-item__info">
                                <div className="invoice-item__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="invoice-item__details">
                                    <h4>{devis.devisNumber}</h4>
                                    <p>{devis.clientName}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                        Créé le : {new Date(devis.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Status Dropdown */}
                            <div className="status-dropdown">
                                <select
                                    className={`status-select status-select--${devis.status}`}
                                    value={devis.status}
                                    onChange={(e) => handleStatusChange(devis.id, e.target.value)}
                                    disabled={changingStatus === devis.id || devis.convertedToInvoice}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {changingStatus === devis.id && (
                                    <div className="status-loading">
                                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                    </div>
                                )}
                            </div>

                            <span className="invoice-item__amount">
                                {devis.total.toFixed(2)} DH
                            </span>

                            <div className="invoice-item__actions">
                                {/* Convert to Invoice button */}
                                {!devis.convertedToInvoice && (
                                    <button
                                        className="btn btn--primary btn--sm"
                                        onClick={() => handleConvert(devis.id)}
                                        disabled={converting === devis.id}
                                        title="Convertir en facture"
                                    >
                                        {converting === devis.id ? (
                                            <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                        Facture
                                    </button>
                                )}

                                {devis.convertedToInvoice && (
                                    <span className="badge badge--paid" style={{ fontSize: '0.7rem' }}>
                                        ✓ Converti
                                    </span>
                                )}

                                <button
                                    className="btn btn--success btn--sm"
                                    onClick={() => onDownloadPDF(devis.id)}
                                    title="Télécharger le PDF"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    PDF
                                </button>

                                <button
                                    className="btn btn--danger btn--sm"
                                    onClick={() => onDelete(devis.id)}
                                    title="Supprimer le devis"
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

export default DevisList;
