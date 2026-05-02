type FormInputProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};

export function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: FormInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-xl bg-surface-container-high px-4 py-2.5 text-sm text-on-surface outline-none transition focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
