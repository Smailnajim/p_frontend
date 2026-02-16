import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceList from '../components/InvoiceList';

function InvoicesPage({ showToast, apiUrl }) {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list');

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/invoices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setInvoices(data.data);
            }
        } catch (error) {
            showToast('Échec de la récupération des factures', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch(`${apiUrl}/clients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setClients(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch clients');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${apiUrl}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products');
        }
    };

    useEffect(() => {
        if (token) {
            fetchInvoices();
            fetchClients();
            fetchProducts();
        }
    }, [token]);

    const handleCreateInvoice = async (invoiceData) => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(invoiceData),
            });
            const data = await response.json();

            if (data.success) {
                setInvoices([...invoices, data.data]);
                showToast('Facture créée avec succès !');
                setActiveTab('list');
                return true;
            } else {
                showToast(data.message || 'Échec de la création de la facture', 'error');
                return false;
            }
        } catch (error) {
            showToast('Échec de la création de la facture', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/invoices/${id}/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Échec de la génération du PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('PDF téléchargé avec succès !');
        } catch (error) {
            showToast('Échec du téléchargement du PDF', 'error');
        }
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/invoices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setInvoices(invoices.filter(inv => inv.id !== id));
                showToast('Facture supprimée avec succès !');
            } else {
                showToast(data.message || 'Échec de la suppression de la facture', 'error');
            }
        } catch (error) {
            showToast('Échec de la suppression de la facture', 'error');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(`${apiUrl}/invoices/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();

            if (data.success) {
                setInvoices(invoices.map(inv =>
                    inv.id === id ? { ...inv, status: newStatus } : inv
                ));
                showToast(`Statut de la facture mis à jour : ${newStatus} !`);
            } else {
                showToast(data.message || 'Échec de la mise à jour du statut', 'error');
            }
        } catch (error) {
            showToast('Échec de la mise à jour du statut', 'error');
        }
    };

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingCount = invoices.filter(inv => inv.status === 'pending').length;

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header__title">
                    <div className="page-header__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2>Factures</h2>
                        <p>Gérez vos factures et paiements</p>
                    </div>
                </div>
                <button
                    className="btn btn--primary"
                    onClick={() => setActiveTab('create')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer une nouvelle facture
                </button>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
                <InvoiceList
                    invoices={invoices}
                    onDownloadPDF={handleDownloadPDF}
                    onDelete={handleDeleteInvoice}
                    onStatusChange={handleStatusChange}
                    loading={loading}
                />
            ) : (
                <div className="card animate-fadeIn">
                    <div className="card__header">
                        <h3 className="card__title">Créer une nouvelle facture</h3>
                        <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setActiveTab('list')}
                        >
                            Annuler
                        </button>
                    </div>
                    <div className="card__body">
                        <InvoiceForm
                            onSubmit={handleCreateInvoice}
                            loading={loading}
                            clients={clients}
                            products={products}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default InvoicesPage;
