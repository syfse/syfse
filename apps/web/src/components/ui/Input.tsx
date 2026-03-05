interface InputProps {
    label: string;
    placeholder: string;
    className?: string;
    type?: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
}

export function Input({ label, placeholder, type = "text", className, required = false, value = "", onChange }: InputProps) {
  return (
    <div className={`w-full max-w-sm min-w-[200px] ${className}`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <input
        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
      />
    </div>
  );
}
