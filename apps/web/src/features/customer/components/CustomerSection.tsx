
interface CustomerSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function CustomerSection({
  title,
  description,
  action,
  children,
  className = "",
}: CustomerSectionProps) {
  return (
    <section className={`w-full ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-stone-500">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}
