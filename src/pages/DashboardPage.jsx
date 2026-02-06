import { useState, useEffect } from 'react';

const DashboardPage = ({ apiUrl }) => {
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalRevenue: 0,
        pendingInvoices: 0,
        totalClients: 0
    });

    useEffect(() => {
        // Simulate fetching stats or fetch real aggregated data
        // For now, we'll fetch invoices to calculate
        const fetchData = async () => {
            try {
                const [invoicesRes, clientsRes] = await Promise.all([
                    fetch(`${apiUrl}/invoices`),
                    fetch(`${apiUrl}/clients`)
                ]);

                const invoicesData = await invoicesRes.json();
                const clientsData = await clientsRes.json();

                if (invoicesData.success && clientsData.success) {
                    const invoices = invoicesData.data;
                    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
                    const pending = invoices.filter(inv => inv.status === 'pending').length;

                    setStats({
                        totalInvoices: invoices.length,
                        totalRevenue,
                        pendingInvoices: pending,
                        totalClients: clientsData.data.length
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };

        fetchData();
    }, [apiUrl]);

    return (
        <div className="dashboard animate-fadeIn">
            <div className="dashboard__header">
                <h1>Dashboard</h1>
                <p>Welcome back, Admin</p>
            </div>

            <div className="grid grid--2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-card__value">${stats.totalRevenue.toFixed(2)}</div>
                        <div className="stat-card__label">Total Revenue</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-card__value">{stats.totalInvoices}</div>
                        <div className="stat-card__label">Total Invoices</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-card__value">{stats.pendingInvoices}</div>
                        <div className="stat-card__label">Pending Payments</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-card__value">{stats.totalClients}</div>
                        <div className="stat-card__label">Active Clients</div>
                    </div>
                </div>
            </div>

            {/* Chart Section Placeholder */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card__header">
                    <h3 className="card__title">Revenue Overview</h3>
                </div>
                <div className="card__body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                    Chart visualization would go here
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
