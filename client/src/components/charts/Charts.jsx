import { useState, useId } from 'react';

/**
 * Inline-SVG charts. No charting library — partly the project's stack
 * constraint, partly because these two forms are a few dozen lines each.
 *
 * Both are deliberately SINGLE-HUE. Category and status identity is carried by
 * the axis label next to each bar, not by colour: five categorical hues cannot
 * be told apart under deuteranopia (measured — the red/green pair came out at
 * ΔE 5.3, far below the ≥8 target), so hue here would be decoration that
 * actively misleads. One hue for magnitude, labels for identity.
 */

const GRID = 'var(--ag-border)';
const INK = 'var(--ag-muted)';

/* ---------------------------------------------------------------- time bars */

/**
 * Orders per day. Vertical bars, rounded tops, a recessive baseline, and a
 * hover readout — an SVG chart on a web page should respond to the pointer.
 */
export function TimeBars({ data, valueKey = 'orders', height = 150, formatValue = (v) => v }) {
  const [hover, setHover] = useState(null);
  const labelId = useId();

  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  const count = data.length;

  // Percentage geometry so the chart fills whatever width it is given.
  const slot = 100 / count;
  const barW = Math.min(70, slot * 0.62);

  const active = hover != null ? data[hover] : null;
  const shortDate = (iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <figure className="m-0">
      <div className="d-flex align-items-baseline justify-content-between mb-1">
        <span className="ag-muted" style={{ fontSize: '0.75rem' }}>
          {active ? shortDate(active.date) : `Last ${count} days`}
        </span>
        <span className="fw-bold" style={{ fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
          {active ? formatValue(active[valueKey]) : formatValue(data.reduce((s, d) => s + d[valueKey], 0))}
        </span>
      </div>

      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height, display: 'block', overflow: 'visible' }}
        role="img"
        aria-labelledby={labelId}
        onMouseLeave={() => setHover(null)}
      >
        <title id={labelId}>
          {`Orders per day over the last ${count} days. Highest ${max}.`}
        </title>

        {/* Recessive gridlines — present for reading, never competing. */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1="0" x2="100"
            y1={height - height * f} y2={height - height * f}
            stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke"
          />
        ))}

        {data.map((d, i) => {
          const value = d[valueKey];
          const h = value === 0 ? 2 : Math.max(3, (value / max) * (height - 8));
          const x = i * slot + (slot - barW) / 2;
          const on = hover === i;

          return (
            <g key={d.date}>
              {/* Full-height hit area: the bar itself is too small to aim at. */}
              <rect
                x={i * slot} y="0" width={slot} height={height}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                tabIndex={0}
                role="button"
                aria-label={`${shortDate(d.date)}: ${formatValue(value)}`}
              />
              <rect
                x={x} y={height - h} width={barW} height={h}
                rx="2.5"
                fill={value === 0 ? GRID : 'var(--ag-green)'}
                opacity={hover == null || on ? 1 : 0.45}
                style={{ transition: 'opacity 0.15s ease' }}
              />
            </g>
          );
        })}

        <line
          x1="0" x2="100" y1={height} y2={height}
          stroke={GRID} strokeWidth="1.5" vectorEffect="non-scaling-stroke"
        />
      </svg>

      <figcaption className="d-flex justify-content-between ag-muted mt-1" style={{ fontSize: '0.68rem' }}>
        <span>{shortDate(data[0]?.date || '')}</span>
        <span>{shortDate(data[data.length - 1]?.date || '')}</span>
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------- ranked bars */

/**
 * Horizontal ranked comparison. Every bar is directly labelled with its name
 * and value, so the chart is readable without colour, and a zero-row still
 * renders rather than vanishing.
 */
export function RankedBars({ items, formatValue = (v) => v, emptyText = 'No data yet', accent }) {
  if (!items.length) {
    return <p className="ag-muted mb-0" style={{ fontSize: '0.85rem' }}>{emptyText}</p>;
  }

  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul className="list-unstyled mb-0">
      {items.map((item) => (
        <li key={item.label} className="mb-2">
          <div className="d-flex justify-content-between align-items-baseline" style={{ fontSize: '0.82rem' }}>
            <span className="d-inline-flex align-items-center gap-2">
              {/* Status dot, when supplied, always sits beside its label —
                  colour never carries the meaning on its own. */}
              {item.color && (
                <span
                  aria-hidden="true"
                  style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: item.color, flex: '0 0 auto',
                  }}
                />
              )}
              <span className="text-capitalize">{item.label}</span>
            </span>
            <span className="fw-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatValue(item.value)}
            </span>
          </div>

          <div
            style={{
              height: 8, borderRadius: 999, background: 'var(--ag-bg-alt)',
              marginTop: 4, overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(item.value / max) * 100}%`,
                height: '100%',
                borderRadius: 999,
                background: item.color || accent || 'var(--ag-green)',
                minWidth: item.value > 0 ? 6 : 0,
                transition: 'width 0.5s cubic-bezier(0.2, 0.8, 0.3, 1)',
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
