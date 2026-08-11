import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../api/axios';
import { LeafIcon } from '../components/Icons';

const EMPTY = {
  name: '', email: '', phone: '', password: '',
  role: 'consumer', farmName: '', location: '',
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

    // Consumers never send shop details.
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

  const invalid = (field) => (fieldErrors[field] ? 'is-invalid' : '');

  return (
    <div className="ag-shell px-3 py-4 d-flex justify-content-center">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
            style={{ width: 58, height: 58, background: 'var(--ag-green)', color: '#fff' }}
          >
            <LeafIcon size={28} />
          </div>
          <h1 className="fw-bold text-agrilink mb-1" style={{ fontSize: '1.5rem' }}>Join Agrilink</h1>
          <p className="ag-muted mb-0" style={{ fontSize: '0.88rem' }}>Buy fresh produce, or sell what you grow.</p>
        </div>

        <div className="ag-panel">
          {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.86rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Role decides which fields matter, so it comes first. */}
            <label className="form-label small fw-semibold mb-1">I am a</label>
            <div className="ag-segment mb-3">
              <button
                type="button"
                className={!isRetailer ? 'active' : ''}
                onClick={() => setForm((prev) => ({ ...prev, role: 'consumer' }))}
              >
                Consumer
              </button>
              <button
                type="button"
                className={isRetailer ? 'active' : ''}
                onClick={() => setForm((prev) => ({ ...prev, role: 'retailer' }))}
              >
                Retailer / Farmer
              </button>
            </div>

            <Field id="name" label="Full name" value={form.name} onChange={update('name')} error={fieldErrors.name} invalid={invalid('name')} autoComplete="name" />
            <Field id="email" label="Email" type="email" value={form.email} onChange={update('email')} error={fieldErrors.email} invalid={invalid('email')} autoComplete="email" />

            <label htmlFor="phone" className="form-label small fw-semibold mb-1">Phone number</label>
            <div className="input-group mb-1">
              <span className="input-group-text" style={{ borderRadius: '10px 0 0 10px' }}>+91</span>
              <input
                id="phone"
                className={`ag-input ${invalid('phone')}`}
                style={{ borderRadius: '0 10px 10px 0' }}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                value={form.phone}
                onChange={update('phone')}
                required
              />
            </div>
            {fieldErrors.phone
              ? <div className="text-danger mb-3" style={{ fontSize: '0.78rem' }}>{fieldErrors.phone}</div>
              : <div className="ag-muted mb-3" style={{ fontSize: '0.76rem' }}>You can log in with this number or your email.</div>}

            <Field id="password" label="Password" type="password" value={form.password} onChange={update('password')} error={fieldErrors.password} invalid={invalid('password')} autoComplete="new-password" hint="At least 6 characters." />

            {isRetailer && (
              <>
                <Field id="farmName" label="Farm / shop name" value={form.farmName} onChange={update('farmName')} error={fieldErrors.farmName} invalid={invalid('farmName')} />
                <Field id="location" label="Location" placeholder="Village / town, district" value={form.location} onChange={update('location')} error={fieldErrors.location} invalid={invalid('location')} />
              </>
            )}

            <button className="btn btn-agrilink w-100 py-2 mt-2" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center ag-muted mt-3 mb-0" style={{ fontSize: '0.84rem' }}>
            Already have an account? <Link to="/login" className="fw-semibold text-decoration-none">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, error, invalid, hint, ...props }) {
  return (
    <>
      <label htmlFor={id} className="form-label small fw-semibold mb-1">{label}</label>
      <input id={id} className={`ag-input ${invalid}`} required {...props} />
      {error
        ? <div className="text-danger mb-3 mt-1" style={{ fontSize: '0.78rem' }}>{error}</div>
        : hint
          ? <div className="ag-muted mb-3 mt-1" style={{ fontSize: '0.76rem' }}>{hint}</div>
          : <div className="mb-3" />}
    </>
  );
}
