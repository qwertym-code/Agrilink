import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import TopBar from '../components/TopBar';
import { TimeBars, RankedBars } from '../components/charts/Charts';
import { formatPrice, titleCase } from '../utils/format';
import { UserIcon, ShopIcon, CartIcon, LeafIcon } from '../components/Icons';

/**
 * Order status colours come from the reserved status palette and always ship
 * beside a text label — a status colour must never carry meaning alone.
 */
const STATUS_COLOR = {
  placed: '#3b82c4',
  confirmed: '#0ca30c',
  'out-for-delivery': '#fab219',
  delivered: '#0ca30c',
  cancelled: '#d03b3b',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/admin/stats')
      .then(({ data }) => { if (!cancelled) setStats(data); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <>
        <TopBar title="Dashboard" />
        <div className="ag-shell px-3 pt-3">
          <div className="ag-grid mb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ag-skeleton" style={{ height: 92 }} />
            ))}
          </div>
          <div className="ag-skeleton" style={{ height: 200 }} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar title="Dashboard" />
        <div className="ag-shell px-3 pt-4">
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-1">Couldn't load the dashboard</p>
            <p className="ag-muted mb-0" style={{ fontSize: '0.85rem' }}>{error}</p>
          </div>
        </div>
      </>
    );
  }

  const { users, products, orders, timeline, topProducts } = stats;

  return (
    <>
      <TopBar title="Dashboard" />

      <div className="ag-shell px-3 pt-3">
        <p className="ag-eyebrow mb-2">Platform overview</p>

        {/* Headline numbers. A count is a number, not a chart — a stat tile
            reads faster than any plot of four values would. */}
        <div className="ag-grid mb-3">
          <Stat label="Users" value={users.total} sub={`${users.consumers} buying · ${users.retailers} selling`} Icon={UserIcon} />
          <Stat label="Products" value={products.total} sub={products.outOfStock ? `${products.outOfStock} out of stock` : 'all in stock'} Icon={ShopIcon} />
          <Stat label="Orders" value={orders.total} sub={`${orders.itemsSold} items sold`} Icon={CartIcon} />
          <Stat label="Revenue" value={formatPrice(orders.revenue)} sub={`avg ${formatPrice(orders.averageOrder)}`} Icon={LeafIcon} />
        </div>

        <div className="ag-panel mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h2 className="ag-section-title mb-0">Orders over time</h2>
            <button
              className="btn btn-sm btn-agrilink-outline py-1 px-3"
              style={{ minHeight: 32, fontSize: '0.76rem' }}
              onClick={() => setShowTable((s) => !s)}
              aria-expanded={showTable}
            >
              {showTable ? 'Show chart' : 'Show table'}
            </button>
          </div>

          {/* A table alternative is not optional — a chart alone is not
              screen-reader friendly, and the numbers are often what's wanted. */}
          {showTable ? (
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              <table className="table table-sm mb-0" style={{ fontSize: '0.82rem' }}>
                <caption className="visually-hidden">Orders and revenue per day</caption>
                <thead>
                  <tr><th scope="col">Date</th><th scope="col" className="text-end">Orders</th><th scope="col" className="text-end">Revenue</th></tr>
                </thead>
                <tbody>
                  {timeline.map((d) => (
                    <tr key={d.date}>
                      <td>{new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td className="text-end" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.orders}</td>
                      <td className="text-end" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatPrice(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <TimeBars data={timeline} valueKey="orders" />
          )}
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="ag-panel h-100">
              <h2 className="ag-section-title">Products by category</h2>
              <RankedBars
                items={products.byCategory.map((c) => ({ label: titleCase(c.category), value: c.count }))}
                emptyText="No listings yet"
              />
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="ag-panel h-100">
              <h2 className="ag-section-title">Orders by status</h2>
              <RankedBars
                items={orders.byStatus.map((s) => ({
                  label: titleCase(s.status),
                  value: s.count,
                  color: STATUS_COLOR[s.status],
                }))}
                emptyText="No orders yet"
              />
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="ag-panel h-100">
              <h2 className="ag-section-title">Payment method</h2>
              <RankedBars
                items={orders.byPayment.map((p) => ({
                  label: p.method === 'cod' ? 'Cash on delivery' : 'Card / UPI (demo)',
                  value: p.count,
                }))}
                emptyText="No orders yet"
              />
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="ag-panel h-100">
              <h2 className="ag-section-title">Best sellers</h2>
              <RankedBars
                items={topProducts.map((p) => ({ label: p.name, value: p.units }))}
                formatValue={(v) => `${v} sold`}
                emptyText="Nothing sold yet"
              />
            </div>
          </div>
        </div>

        <p className="ag-muted text-center mt-3 mb-0" style={{ fontSize: '0.72rem' }}>
          Aggregate figures only — no personal data leaves the server.
        </p>
      </div>
    </>
  );
}

function Stat({ label, value, sub, Icon }) {
  return (
    <div className="ag-panel d-flex flex-column gap-1">
      <span className="d-flex align-items-center gap-2 ag-muted" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
        <Icon size={15} /> {label}
      </span>
      <span
        className="fw-bold"
        style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}
      >
        {value}
      </span>
      <span className="ag-muted" style={{ fontSize: '0.72rem' }}>{sub}</span>
    </div>
  );
}
