type Option = {
  label: string;
  value: string;
};

type DropdownProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
};

export function Dropdown({
  label,
  value,
  onChange,
  options,
  required,
}: DropdownProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="rounded-xl bg-surface-container-high px-4 py-2.5 text-sm text-on-surface outline-none transition focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
