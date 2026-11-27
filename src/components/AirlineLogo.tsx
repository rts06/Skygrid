interface AirlineLogoProps {
  className?: string;
}

export function AirlineLogo({ className = 'w-8 h-8' }: AirlineLogoProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.12)" />
      <path
        d="M8.5 23.5L26.5 11.5L21.5 25.5L16.8 20.8L11.5 25L12.6 19.2L8.5 23.5Z"
        fill="#38BDF8"
      />
      <path
        d="M26.5 11.5L15.2 18.6L16.8 20.8L26.5 11.5Z"
        fill="#E0F2FE"
      />
    </svg>
  );
}
