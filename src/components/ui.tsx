type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-1">
      {eyebrow ? (
        <span className="text-xs font-bold uppercase tracking-normal text-[#68746c]">
          {eyebrow}
        </span>
      ) : null}
      <h1 className="text-3xl font-black tracking-normal text-[#1f2723]">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-sm leading-6 text-[#68746c]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
type PanelProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-[#d9ded4] bg-white p-5 shadow-sm shadow-black/0 ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-base font-black tracking-normal text-[#1f2723]">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

type PillProps = {
  children: React.ReactNode;
};

export function Pill({ children }: PillProps) {
  return (
    <span className="rounded-full border border-[#d9ded4] bg-[#f7f9f5] px-3 py-1 text-xs font-medium text-[#465249]">
      {children}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e9ede5]">
      <div className="h-full rounded-full bg-[#157f5b]" style={{ width: `${value}%` }} />
    </div>
  );
}
