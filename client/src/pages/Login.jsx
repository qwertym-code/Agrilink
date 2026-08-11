import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { LeafIcon } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // One field for both credentials — the server works out which it is.
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      navigate(dashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ag-shell px-3 py-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="auth-card">
        <div className="text-center mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{ width: 58, height: 58, background: 'var(--ag-green)', color: '#fff' }}
          >
            <LeafIcon size={28} />
          </div>
          <h1 className="fw-bold text-agrilink mb-1" style={{ fontSize: '1.5rem' }}>Agrilink</h1>
          <p className="ag-muted mb-0" style={{ fontSize: '0.88rem' }}>
            Fresh produce, straight from the farmer.
          </p>
        </div>

        <div className="ag-panel">
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>Welcome back</h2>
          <p className="ag-muted mb-3" style={{ fontSize: '0.84rem' }}>Log in to your account.</p>

          {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.86rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="identifier" className="form-label small fw-semibold mb-1">
              Email or phone number
            </label>
            <input
              id="identifier"
              className="ag-input"
              type="text"
              autoComplete="username"
              placeholder="you@example.com or 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <div className="ag-muted mb-3 mt-1" style={{ fontSize: '0.76rem' }}>
              Use whichever you signed up with.
            </div>

            <label htmlFor="password" className="form-label small fw-semibold mb-1">Password</label>
            <input
              id="password"
              className="ag-input mb-4"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="btn btn-agrilink w-100 py-2" type="submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center ag-muted mt-3 mb-0" style={{ fontSize: '0.84rem' }}>
            New to Agrilink? <Link to="/register" className="fw-semibold text-decoration-none">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
