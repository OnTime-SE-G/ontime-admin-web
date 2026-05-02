type TableProps = {
  children: React.ReactNode;
};

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-soft">
      <table className="min-w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}
