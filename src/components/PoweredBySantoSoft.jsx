export function PoweredBySantoSoft({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 py-4 ${className}`}>
      <span className="text-[11px] text-brand-dark/40">Powered by</span>
      <img src="/branding/santosoft-logo.png" alt="SantoSoft" className="h-3.5 w-auto opacity-60" />
    </div>
  );
}
