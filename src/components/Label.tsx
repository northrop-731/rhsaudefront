interface LabelProps {
  text: string;
  required?: boolean;
  htmlFor?: string;
}

// Rótulo padrão dos campos de formulário.
// É instanciado diretamente pelo FormGroup.tsx para manter o padrão visual e exibir o asterisco de campo obrigatório.
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
      {/* Adiciona o asterisco vermelho quando a prop required é true */}
      {required && (
        <span className="text-red-500 ml-1">*</span>
      )}
    </label>
  );
};
