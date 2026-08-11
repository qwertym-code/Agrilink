import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';

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
    <div className="d-flex justify-content-center">
      <div className="card shadow-sm auth-card">
        <div className="card-body p-4">
          <h2 className="h4 mb-1 text-agrilink">Welcome back</h2>
          <p className="text-muted small mb-4">Log in to your Agrilink account.</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="identifier" className="form-label">
                Email or phone number
              </label>
              <input
                id="identifier"
                className="form-control"
                type="text"
                autoComplete="username"
                placeholder="you@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <div className="form-text">Use whichever you signed up with.</div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                className="form-control"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-agrilink w-100" type="submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            New to Agrilink? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
