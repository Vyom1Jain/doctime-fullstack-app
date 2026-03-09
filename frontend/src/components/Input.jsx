export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  required = false,
  className = '',
  ...rest
}) {
  const registration = register ? register(name, { required }) : { name };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-400' : ''}`}
        {...registration}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="text-red-500 text-sm mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
