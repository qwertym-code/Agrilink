import { useNavigate } from 'react-router-dom';
import { BackIcon } from './Icons';

/** Sticky screen header: optional back arrow, centred title, optional action. */
export default function TopBar({ title, back = false, action = null }) {
  const navigate = useNavigate();

  return (
    <div className="ag-topbar">
      <div className="ag-shell d-flex align-items-center gap-2 px-3 py-2" style={{ paddingBottom: 0 }}>
        {back ? (
          <button
            className="btn btn-sm border-0 p-1"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackIcon size={22} />
          </button>
        ) : (
          <span style={{ width: 30 }} />
        )}

        <div className="flex-grow-1 text-center ag-title">{title}</div>

        <span style={{ minWidth: 30 }} className="text-end">{action}</span>
      </div>
    </div>
  );
}
