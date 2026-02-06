import { useState, useEffect } from 'react';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceList from '../components/InvoiceList';

function InvoicesPage({ showToast, apiUrl }) {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list');

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/invoices`);
            const data = await response.json();
            if (data.success) {
                setInvoices(data.data);
            }
        } catch (error) {
            showToast('Failed to fetch invoices', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch(`${apiUrl}/clients`);
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
            const response = await fetch(`${apiUrl}/products`);
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products');
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchClients();
        fetchProducts();
    }, []);

    const handleCreateInvoice = async (invoiceData) => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoiceData),
            });
            const data = await response.json();

            if (data.success) {
                setInvoices([...invoices, data.data]);
                showToast('Invoice created successfully!');
                setActiveTab('list');
                return true;
            } else {
                showToast(data.message || 'Failed to create invoice', 'error');
                return false;
            }
        } catch (error) {
            showToast('Failed to create invoice', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/invoices/${id}/pdf`);

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
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
            showToast('PDF downloaded successfully!');
        } catch (error) {
            showToast('Failed to download PDF', 'error');
        }
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/invoices/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setInvoices(invoices.filter(inv => inv.id !== id));
                showToast('Invoice deleted successfully!');
            } else {
                showToast(data.message || 'Failed to delete invoice', 'error');
            }
        } catch (error) {
            showToast('Failed to delete invoice', 'error');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(`${apiUrl}/invoices/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();

            if (data.success) {
                setInvoices(invoices.map(inv =>
                    inv.id === id ? { ...inv, status: newStatus } : inv
                ));
                showToast(`Invoice status updated to ${newStatus}!`);
            } else {
                showToast(data.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            showToast('Failed to update status', 'error');
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
                        <h2>Invoices</h2>
                        <p>Manage your invoices and payments</p>
                    </div>
                </div>
                <button
                    className="btn btn--primary"
                    onClick={() => setActiveTab('create')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Invoice
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
                        <h3 className="card__title">Create New Invoice</h3>
                        <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setActiveTab('list')}
                        >
                            Cancel
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
