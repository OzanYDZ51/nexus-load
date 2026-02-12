interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-9">
      <h1 className="font-[family-name:var(--font-display)] text-[28px] font-extrabold tracking-[2px] mb-1.5">
        <span className="gradient-text">{title}</span>
      </h1>
      <p className="text-[15px] text-text-secondary font-normal">{subtitle}</p>
    </div>
  );
}
