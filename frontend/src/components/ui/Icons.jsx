// Simple line icons used inside the portal (sidebar, buttons).

function Icon({ size = 18, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9.5h13V10" />
  </Icon>
);

export const StudentIcon = (p) => (
  <Icon {...p}>
    <path d="m2.5 9 9.5-4.5L21.5 9 12 13.5z" />
    <path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11" />
  </Icon>
);

export const GroupIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.8a3 3 0 0 1 0 5.4M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
  </Icon>
);

export const BookIcon = (p) => (
  <Icon {...p}>
    <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z" />
    <path d="M5 16.5a3 3 0 0 1 3-3h11" />
  </Icon>
);

export const BuildingIcon = (p) => (
  <Icon {...p}>
    <path d="M3 20h18M4.5 9.5 12 4l7.5 5.5" />
    <path d="M6.5 10.5V18M10 10.5V18M14 10.5V18M17.5 10.5V18" />
  </Icon>
);

export const DoorIcon = (p) => (
  <Icon {...p}>
    <path d="M6 20V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15M4 20h16" />
    <circle cx="14.5" cy="12.5" r="0.6" fill="currentColor" />
  </Icon>
);

export const LinkIcon = (p) => (
  <Icon {...p}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="M11 6.5 12.5 5a4 4 0 0 1 6.5 6.5L17.5 13M13 17.5 11.5 19A4 4 0 0 1 5 12.5L6.5 11" />
  </Icon>
);

export const SheetIcon = (p) => (
  <Icon {...p}>
    <path d="M7 3.5h7.5L19 8v12.5H7z" />
    <path d="M14 3.5V8.5h5M10 13h6M10 16.5h6" />
  </Icon>
);

export const ChartIcon = (p) => (
  <Icon {...p}>
    <path d="M4 20h16" />
    <path d="M7 16v-5M12 16V7M17 16v-8" />
  </Icon>
);

export const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="5.5" width="16" height="15" rx="2" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 14.5l2 2 4-4" />
  </Icon>
);

export const UserCogIcon = (p) => (
  <Icon {...p}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M3.5 20a6.5 6.5 0 0 1 10.5-5.1" />
    <circle cx="18" cy="17" r="2.2" />
    <path d="M18 13.3v1.5M18 19.2v1.5M14.8 17h1M20.2 17h1" />
  </Icon>
);

export const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M14 4.5H6.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H14" />
    <path d="M10.5 12H20M16.5 8.5 20 12l-3.5 3.5" />
  </Icon>
);

export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);

export const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

export const EditIcon = (p) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
  </Icon>
);

export const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </Icon>
);

export const PrintIcon = (p) => (
  <Icon {...p}>
    <path d="M7 9V3.5h10V9M7 17H4.5V9h15v8H17" />
    <path d="M7 14h10v6.5H7z" />
  </Icon>
);

export const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </Icon>
);

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const WandIcon = (p) => (
  <Icon {...p}>
    <path d="m4 20 11-11M14 4v3M12.5 5.5h3M19 9v3M17.5 10.5h3M18 3.5l.01 0" />
  </Icon>
);
