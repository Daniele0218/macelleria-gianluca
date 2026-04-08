export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className="animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-success)]"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
