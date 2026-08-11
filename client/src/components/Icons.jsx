/**
 * Inline SVG icons. Kept local rather than pulling in an icon package — the
 * marketplace needs about ten glyphs and they all inherit currentColor.
 */
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const Svg = ({ children, size = 20, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>{children}</svg>
);

export const SearchIcon = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></Svg>;
export const HomeIcon = (p) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20h13V9.5" /></Svg>;
export const ShopIcon = (p) => <Svg {...p}><path d="M4 8h16l-1 12H5L4 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>;
export const CartIcon = (p) => <Svg {...p}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M3 4h2l2.4 11h11l2-8H6" /></Svg>;
export const UserIcon = (p) => <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></Svg>;
export const BackIcon = (p) => <Svg {...p}><path d="m14.5 5-7 7 7 7" /></Svg>;
export const PlusIcon = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const MinusIcon = (p) => <Svg {...p}><path d="M5 12h14" /></Svg>;
export const TrashIcon = (p) => <Svg {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></Svg>;
export const PinIcon = (p) => <Svg {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></Svg>;
export const StarIcon = (p) => <Svg {...p} fill="currentColor" stroke="none"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" /></Svg>;
export const LeafIcon = (p) => <Svg {...p}><path d="M20 4C10 4 4 9 4 16v4" /><path d="M20 4c0 9-5 13-12 13" /></Svg>;
export const AppleIcon = (p) => <Svg {...p}><circle cx="12" cy="14" r="6.5" /><path d="M12 7.5V5m0 0c1.5-1.5 3-1 3-1" /></Svg>;
export const MilkIcon = (p) => <Svg {...p}><path d="M9 3h6v3l2 4v10H7V10l2-4Z" /><path d="M7 13h10" /></Svg>;
export const BreadIcon = (p) => <Svg {...p}><path d="M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 0 8v4H8v-4a4 4 0 0 1-4-4Z" /></Svg>;
export const BasketIcon = (p) => <Svg {...p}><path d="M3 9h18l-2 11H5L3 9Z" /><path d="m8 9 3-5m5 5-3-5" /></Svg>;
export const CheckIcon = (p) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
export const EditIcon = (p) => <Svg {...p}><path d="M4 20h4L20 8l-4-4L4 16v4Z" /></Svg>;
export const SunIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" /></Svg>;
export const MoonIcon = (p) => <Svg {...p}><path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z" /></Svg>;
export const MonitorIcon = (p) => <Svg {...p}><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M9 20h6M12 16.5V20" /></Svg>;

/** Category id → icon, used by the home screen circles. */
export const categoryIcon = {
  vegetables: LeafIcon,
  fruits: AppleIcon,
  dairy: MilkIcon,
  bakery: BreadIcon,
  other: BasketIcon,
};
