interface LabelProps {
  text: string;
  required?: boolean;
  htmlFor?: string;
}

export const Label = ({
  text,
  required = false,
  htmlFor,
}: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-black mb-1"
    >
      {text}
      {required && (
        <span className="text-red-500 ml-1">*</span>
      )}
    </label>
  );
};