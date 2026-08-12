import { useState } from 'react';
import api, { getErrorMessage } from '../api/axios';

const PRESETS = {
  retailer: [
    "Crop wasn't ready",
    'Sold out today',
    "Can't deliver to that area",
    'Price listed by mistake',
  ],
  consumer: [
    'Ordered by mistake',
    'Changed my mind',
    'Need it sooner',
    "Address isn't right",
  ],
};

/**
 * Cancelling is destructive and permanent, so it takes two steps: the button
 * opens a form rather than firing immediately, and the confirm stays disabled
 * until a reason is given. The presets exist because a required free-text box
 * otherwise gets filled with "." just to get past it.
 */
export default function CancelOrder({ orderId, role = 'consumer', onCancelled }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/orders/${orderId}/cancel`, { reason: reason.trim() });
      onCancelled?.(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        className="btn btn-outline-danger btn-sm w-100"
        style={{ borderRadius: 999, minHeight: 40 }}
        onClick={() => setOpen(true)}
      >
        {role === 'retailer' ? "Can't fulfil this order" : 'Cancel order'}
      </button>
    );
  }

  return (
    <div
      className="p-3 mt-1"
      style={{
        border: '1px solid var(--ag-border)',
        borderRadius: 'var(--ag-radius-sm)',
        background: 'var(--ag-bg-alt)',
      }}
    >
      <p className="fw-semibold mb-1" style={{ fontSize: '0.88rem' }}>
        Why are you cancelling?
      </p>
      <p className="ag-muted mb-2" style={{ fontSize: '0.76rem' }}>
        {role === 'retailer'
          ? 'The buyer sees this, so they know whether to reorder.'
          : 'The farmer sees this. Stock goes back on sale straight away.'}
      </p>

      <div className="ag-chips mb-2">
        {PRESETS[role].map((preset) => (
          <button
            key={preset}
            type="button"
            className={`ag-chip ${reason === preset ? 'active' : ''}`}
            onClick={() => setReason(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      <textarea
        className="ag-input mb-2"
        rows={2}
        maxLength={300}
        placeholder="Or write your own reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-label="Reason for cancelling"
      />

      {error && <div className="alert alert-danger py-2 mb-2" style={{ fontSize: '0.82rem' }}>{error}</div>}

      <div className="d-flex gap-2">
        <button
          className="btn btn-danger btn-sm flex-grow-1"
          style={{ borderRadius: 999, minHeight: 40 }}
          onClick={submit}
          disabled={saving || reason.trim().length < 3}
        >
          {saving ? 'Cancelling…' : 'Cancel this order'}
        </button>
        <button
          className="btn btn-agrilink-outline btn-sm px-3"
          onClick={() => { setOpen(false); setReason(''); setError(''); }}
          disabled={saving}
        >
          Keep it
        </button>
      </div>

      <p className="ag-muted mb-0 mt-2" style={{ fontSize: '0.72rem' }}>
        This can't be undone.
      </p>
    </div>
  );
}

/** Shown once an order is cancelled, on both sides. */
export function CancellationNote({ cancellation }) {
  if (!cancellation?.reason) return null;

  const who = cancellation.byRole === 'retailer' ? 'the farmer' : cancellation.byRole === 'admin' ? 'an administrator' : 'the buyer';

  return (
    <div
      className="mt-2 p-2"
      style={{
        background: 'var(--ag-danger-soft)',
        border: '1px solid var(--ag-danger)',
        borderRadius: 'var(--ag-radius-xs)',
        fontSize: '0.8rem',
      }}
    >
      <strong>Cancelled by {who}.</strong> {cancellation.reason}
      {cancellation.at && (
        <span className="ag-muted d-block" style={{ fontSize: '0.72rem' }}>
          {new Date(cancellation.at).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      )}
    </div>
  );
}
