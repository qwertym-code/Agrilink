import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../api/axios';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'consumer',
  farmName: '',
  location: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isRetailer = form.role === 'retailer';

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    // Consumers never send shop details — the server ignores them anyway,
    // but there's no reason to put them on the wire.
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
      ...(isRetailer ? { farmName: form.farmName.trim(), location: form.location.trim() } : {}),
    };

    try {
      const user = await register(payload);
      navigate(dashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Bootstrap shows .invalid-feedback only next to an .is-invalid control.
  const invalid = (field) => (fieldErrors[field] ? 'is-invalid' : '');

  return (
    <div className="d-flex justify-content-center">
      <div className="card shadow-sm auth-card">
        <div className="card-body p-4">
          <h2 className="h4 mb-1 text-agrilink">Join Agrilink</h2>
          <p className="text-muted small mb-4">
            Buy fresh produce, or sell what you grow.
          </p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Role decides which fields matter, so it comes first. */}
            <div className="mb-3">
              <label className="form-label d-block">I am a</label>
              <div className="btn-group w-100" role="group" aria-label="Account type">
                <input
                  type="radio"
                  className="btn-check"
                  name="role"
                  id="role-consumer"
                  autoComplete="off"
                  checked={!isRetailer}
                  onChange={() => setForm((prev) => ({ ...prev, role: 'consumer' }))}
                />
                <label className="btn btn-outline-success" htmlFor="role-consumer">
                  Consumer
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="role"
                  id="role-retailer"
                  autoComplete="off"
                  checked={isRetailer}
                  onChange={() => setForm((prev) => ({ ...prev, role: 'retailer' }))}
                />
                <label className="btn btn-outline-success" htmlFor="role-retailer">
                  Retailer / Farmer
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full name</label>
              <input
                id="name"
                className={`form-control ${invalid('name')}`}
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                required
              />
              <div className="invalid-feedback">{fieldErrors.name}</div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                className={`form-control ${invalid('email')}`}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                required
              />
              <div className="invalid-feedback">{fieldErrors.email}</div>
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone number</label>
              <div className="input-group">
                <span className="input-group-text">+91</span>
                <input
                  id="phone"
                  className={`form-control ${invalid('phone')}`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={update('phone')}
                  required
                />
                <div className="invalid-feedback">{fieldErrors.phone}</div>
              </div>
              <div className="form-text">You can log in with this number or your email.</div>
            </div>

            <div className={isRetailer ? 'mb-3' : 'mb-4'}>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                className={`form-control ${invalid('password')}`}
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                required
              />
              <div className="invalid-feedback">{fieldErrors.password}</div>
              <div className="form-text">At least 6 characters.</div>
            </div>

            {isRetailer && (
              <>
                <div className="mb-3">
                  <label htmlFor="farmName" className="form-label">Farm / shop name</label>
                  <input
                    id="farmName"
                    className={`form-control ${invalid('farmName')}`}
                    type="text"
                    value={form.farmName}
                    onChange={update('farmName')}
                    required
                  />
                  <div className="invalid-feedback">{fieldErrors.farmName}</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    id="location"
                    className={`form-control ${invalid('location')}`}
                    type="text"
                    placeholder="Village / town, district"
                    value={form.location}
                    onChange={update('location')}
                    required
                  />
                  <div className="invalid-feedback">{fieldErrors.location}</div>
                </div>
              </>
            )}

            <button className="btn btn-agrilink w-100" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
