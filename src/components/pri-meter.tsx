type PriMeterProps = {
  label: string;
  value: number;
};

export function PriMeter({ label, value }: PriMeterProps) {
  return (
    <div className="meter-row">
      <div className="meter-head">
        <span>{label}</span>
        <strong>{value.toFixed(1)}</strong>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
