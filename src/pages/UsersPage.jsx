import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function UsersPage({ showToast, apiUrl }) {
    const { token, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/auth/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            } else {
                showToast(data.message || 'Échec de la récupération des utilisateurs', 'error');
            }
        } catch (error) {
            showToast('Échec de la récupération des utilisateurs', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${apiUrl}/auth/status/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();

            if (data.success) {
                setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
                showToast(`Utilisateur ${newStatus === 'allowed' ? 'approuvé' : 'bloqué'} avec succès !`);
            } else {
                showToast(data.message || 'Échec de la mise à jour du statut', 'error');
            }
        } catch (error) {
            showToast('Échec de la mise à jour du statut', 'error');
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header__title">
                    <div className="page-header__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2>Gestion des utilisateurs</h2>
                        <p>Gérez les accès et les approbations des utilisateurs</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="card__header">
                    <h3 className="card__title">Utilisateurs enregistrés</h3>
                </div>
                <div className="card__body" style={{ padding: 0 }}>
                    {loading && users.length === 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-state__text">Aucun utilisateur trouvé.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>E-mail</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <strong>{u.name}</strong>
                                                {u._id === user?.id && <span className="badge badge--success" style={{ marginLeft: '8px' }}>Vous</span>}
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`badge ${u.status === 'allowed' ? 'badge--success' : 'badge--danger'}`}>
                                                    {u.status || 'blocked'}
                                                </span>
                                            </td>
                                            <td>
                                                {u._id !== user?.id && (
                                                    <div className="data-table__actions">
                                                        {u.status === 'blocked' ? (
                                                            <button
                                                                className="btn btn--primary btn--sm"
                                                                onClick={() => handleUpdateStatus(u._id, 'allowed')}
                                                            >
                                                                Approuver
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn--danger btn--sm"
                                                                onClick={() => handleUpdateStatus(u._id, 'blocked')}
                                                            >
                                                                Bloquer
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
