import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'var(--gray-50)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--primary-600)', marginBottom: '0.5rem' }}>InvoicePro</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Sign in to your account</p>
                </div>

                {error && (
                    <div style={{
                        background: error.includes('blocked') ? '#fff7ed' : '#fee2e2',
                        color: error.includes('blocked') ? '#c2410c' : '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        border: `1px solid ${error.includes('blocked') ? '#fdba74' : '#fca5a5'}`
                    }}>
                        {error.includes('blocked') ? (
                            <>
                                <strong>Authorization Pending:</strong><br />
                                {error}
                            </>
                        ) : error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn--primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Don't have an account? </span>
                    <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
