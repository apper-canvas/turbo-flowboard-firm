import Input from '@/components/atoms/Input';

const FormField = ({ 
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  icon,
  ...props 
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  return (
    <Input
      label={required ? `${label} *` : label}
      type={type}
      value={value || ''}
      onChange={handleChange}
      error={error}
      placeholder={placeholder}
      icon={icon}
      {...props}
    />
  );
};

export default FormField;