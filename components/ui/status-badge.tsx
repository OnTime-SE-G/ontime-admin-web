import clsx from "clsx";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        {
          "bg-secondary-container text-on-secondary-container":
            status === "Active" || status === "Assigned",
          "bg-amber-100 text-amber-700":
            status === "Maintenance" || status === "On Vacation",
          "bg-surface-container-highest text-on-surface-variant":
            status === "Inactive",
        },
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", {
          "bg-primary": status === "Active" || status === "Assigned",
          "bg-amber-500": status === "Maintenance" || status === "On Vacation",
          "bg-outline": status === "Inactive",
        })}
      />
      {status}
    </span>
  );
}
