const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6 8.5 6.5L20.5 6" />
  </svg>
);

export const LockIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1" fill="currentColor" />
  </svg>
);

export const EyeIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const EyeOffIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M10.6 5.6A10.6 10.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3 3.8M6.6 6.6A17.5 17.5 0 0 0 2 12s3.6 6.5 10 6.5a9.8 9.8 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a2.8 2.8 0 0 0 4.2 4.2M3 3l18 18" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} width={16} height={16} strokeWidth={2.2} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const ArrowLeftIcon = (p) => (
  <svg {...base} width={20} height={20} strokeWidth={2} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const MailCheckIcon = (p) => (
  <svg {...base} width={44} height={44} strokeWidth={1.5} {...p}>
    <path d="M21 12.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9" />
    <path d="m3.5 6 8.5 6.5L20.5 6" />
    <path d="m16 18.5 2 2 4-4" />
  </svg>
);
