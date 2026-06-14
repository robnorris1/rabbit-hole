interface Props {
  size?: number;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Rabbit({ size = 24, stroke = 2, className = '', style }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {/* ears */}
      <path d="M21 23 C 16.5 15 16 7 19 5 C 22 6.5 22 15 22.5 23 Z" className="ear" />
      <path d="M27 23 C 31.5 15 32 7 29 5 C 26 6.5 26 15 25.5 23 Z" />
      {/* head dome */}
      <path d="M13.5 30 A 10.5 10.5 0 0 1 34.5 30" />
      {/* nose */}
      <path d="M24 27.5 v1.4" />
      {/* hole rim, broken around the head */}
      <path d="M2 30 L 13 30" />
      <path d="M35 30 L 46 30" />
    </svg>
  );
}