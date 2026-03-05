interface InputProps {
  classes?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function Input({
  classes,
  label,
  placeholder,
  type = "text",
  required = false,
  value = "",
  onChange,
}: InputProps) {
  return (
    <div className={`mt-5 ${classes}`}>
      {label && <p className="text-sm">{label}</p>}
      <input
        className={`w-full bg-transparent text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
      />
    </div>
  );
}
