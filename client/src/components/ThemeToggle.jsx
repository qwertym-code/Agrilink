import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, MonitorIcon } from './Icons';

/**
 * Icon button that flips between light and dark.
 * `aria-pressed` communicates the state to screen readers, since the icon
 * alone conveys nothing to them.
 */
export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const goingDark = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      className={`ag-icon-btn ${className}`}
      aria-pressed={theme === 'dark'}
      aria-label={goingDark ? 'Switch to dark mode' : 'Switch to light mode'}
      title={goingDark ? 'Dark mode' : 'Light mode'}
    >
      <span className="ag-icon-btn-swap" key={theme}>
        {goingDark ? <MoonIcon size={18} /> : <SunIcon size={18} />}
      </span>
    </button>
  );
}

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: MonitorIcon },
];

/**
 * Full three-way control for the profile screen. "System" is worth exposing
 * explicitly — without it, anyone who taps the toggle once is stuck with a
 * fixed theme and no obvious way back to following their device.
 */
export function ThemeChoice() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="ag-segment" role="group" aria-label="Appearance">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={preference === value ? 'active' : ''}
          onClick={() => setPreference(value)}
          aria-pressed={preference === value}
        >
          <span className="d-inline-flex align-items-center gap-1 justify-content-center">
            <Icon size={15} /> {label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
