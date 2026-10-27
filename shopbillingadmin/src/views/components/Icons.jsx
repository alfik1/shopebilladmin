// src/views/components/Icons.jsx

const base = (size, color) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const IconHome = ({ size = 20, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconHistory = ({ size = 20, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M6 3h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v5h5" />
    <path d="M8 13h8M8 16.5h8" />
  </svg>
);

export const IconStock = ({ size = 20, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
);

export const IconCollection = ({ size = 20, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M14 2v5h5" />
    <path d="M8 12h8M8 15.5h8M8 9h4" />
  </svg>
);

export const IconProfile = ({ size = 20, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const IconLogout = ({ size = 18, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const IconMenu = ({ size = 22, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = ({ size = 18, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconBell = ({ size = 18, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
    <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
  </svg>
);

export const IconCalendar = ({ size = 16, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

export const IconFilter = ({ size = 16, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M4 5h16l-6 7.5V19l-4 2v-8.5z" />
  </svg>
);

export const IconAlert = ({ size = 32, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
);

export const IconArrowUp = ({ size = 12, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const IconArrowDown = ({ size = 12, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export const IconTrendingUp = ({ size = 12, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M3 17l6-6 4 4 7-8" />
    <path d="M15 7h5v5" />
  </svg>
);

export const IconChevronDown = ({ size = 14, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconChevronRight = ({ size = 16, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconQr = ({ size = 11, color = 'currentColor' }) => (
  <svg {...base(size, color)} strokeWidth={1.5}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" />
  </svg>
);

export const IconCash = ({ size = 11, color = 'currentColor' }) => (
  <svg {...base(size, color)} strokeWidth={1.5}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconTag = ({ size = 20, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M12.5 2h-5L2 7.5v5L11.5 22l9-9L12.5 2Z" />
    <path d="M7.5 7.5h.01" />
  </svg>
);

export const IconDownload = ({ size = 18, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M4 19h16" />
  </svg>
);

export const IconReceipt = ({ size = 36, color = 'currentColor' }) => (
  <svg {...base(size, color)} strokeWidth={1.5}>
    <path d="M6 2h12v19l-3-2-3 2-3-2-3 2V2Z" />
    <path d="M9 7h6M9 11h6M9 15h3" />
  </svg>
);

export const IconToday = ({ size = 18, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
    <circle cx="12" cy="15" r="2" fill={color} stroke="none" />
  </svg>
);

export const IconCalendarMonth = ({ size = 18, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
    <path d="M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2" />
  </svg>
);

export const IconShare = ({ size = 16, color = 'currentColor' }) => (
  <svg {...base(size, color)}>
    <path d="M12 3v12" />
    <path d="M7 8l5-5 5 5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
);