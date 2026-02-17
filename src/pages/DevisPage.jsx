import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DevisForm from '../components/DevisForm';
import DevisList from '../components/DevisList';

function DevisPage({ showToast, apiUrl }) {
    const { token } = useAuth();
    const [devisList, setDevisList] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list');

    const fetchDevis = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/devis`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDevisList(data.data);
            }
        } catch (error) {
            showToast('Échec de la récupération des devis', 'error');
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
            fetchDevis();
            fetchClients();
            fetchProducts();
        }
    }, [token]);

    const handleCreateDevis = async (devisData) => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/devis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(devisData),
            });
            const data = await response.json();

            if (data.success) {
                setDevisList([data.data, ...devisList]);
                showToast('Devis créé avec succès !');
                setActiveTab('list');
                return true;
            } else {
                showToast(data.message || 'Échec de la création du devis', 'error');
                return false;
            }
        } catch (error) {
            showToast('Échec de la création du devis', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/devis/${id}/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Échec de la génération du PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `devis-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('PDF téléchargé avec succès !');
        } catch (error) {
            showToast('Échec du téléchargement du PDF', 'error');
        }
    };

    const handleDeleteDevis = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/devis/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setDevisList(devisList.filter(d => d.id !== id));
                showToast('Devis supprimé avec succès !');
            } else {
                showToast(data.message || 'Échec de la suppression du devis', 'error');
            }
        } catch (error) {
            showToast('Échec de la suppression du devis', 'error');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(`${apiUrl}/devis/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();

            if (data.success) {
                setDevisList(devisList.map(d =>
                    d.id === id ? { ...d, status: newStatus } : d
                ));
                showToast(`Statut du devis mis à jour : ${newStatus} !`);
            } else {
                showToast(data.message || 'Échec de la mise à jour du statut', 'error');
            }
        } catch (error) {
            showToast('Échec de la mise à jour du statut', 'error');
        }
    };

    const handleConvertToInvoice = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/devis/${id}/convert`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();

            if (data.success) {
                // Update devis in list with new status and convertedToInvoice ref
                setDevisList(devisList.map(d =>
                    d.id === id ? { ...d, status: 'accepted', convertedToInvoice: data.data.invoice.id } : d
                ));
                showToast('Devis converti en facture avec succès !');
            } else {
                showToast(data.message || 'Échec de la conversion', 'error');
            }
        } catch (error) {
            showToast('Échec de la conversion du devis', 'error');
        }
    };

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
                        <h2>Devis</h2>
                        <p>Gérez vos devis et estimations</p>
                    </div>
                </div>
                <button
                    className="btn btn--primary"
                    onClick={() => setActiveTab('create')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer un nouveau devis
                </button>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
                <DevisList
                    devisList={devisList}
                    onDownloadPDF={handleDownloadPDF}
                    onDelete={handleDeleteDevis}
                    onStatusChange={handleStatusChange}
                    onConvertToInvoice={handleConvertToInvoice}
                    loading={loading}
                />
            ) : (
                <div className="card animate-fadeIn">
                    <div className="card__header">
                        <h3 className="card__title">Créer un nouveau devis</h3>
                        <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setActiveTab('list')}
                        >
                            Annuler
                        </button>
                    </div>
                    <div className="card__body">
                        <DevisForm
                            onSubmit={handleCreateDevis}
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

export default DevisPage;
