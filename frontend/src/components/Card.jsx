export default function Card({ className = '', children, onClick }) {
  const interactive = typeof onClick === 'function';

  return (
    <div
      className={`card ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e)
          : undefined
      }
    >
      {children}
    </div>
  );
}
