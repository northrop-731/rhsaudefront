
import Button from './components/Button';
import Card from './components/Card';
import { useForm } from 'react-hook-form';
import { CampoEntrada } from './components/Field';

function formatarCPF(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function App() {
  const { register, setValue, formState: { errors } } = useForm<{
    nome: string;
    cpf: string;
    email: string;
  }>({ mode: 'onChange' });


  return (
    <div className="p-8">
      <Card>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start"
        >
          <CampoEntrada
            placeholder="Digite o nome"
            registro={register('nome', {
              required: 'Nome é obrigatório',
            })}
            erro={errors.nome}
          />

          <CampoEntrada
            type="text"
            inputMode="numeric"
            maxLength={14}
            placeholder="000.000.000-00"
            registro={register('cpf', {
              required: 'CPF é obrigatório',
              pattern: {
                value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                message: 'CPF deve ter 11 dígitos',
              },
              onChange: (event) => {
                const formatado = formatarCPF(event.target.value);

                setValue('cpf', formatado, {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                event.target.value = formatado;
              },
            })}
            erro={errors.cpf}
          />

          <CampoEntrada
            type="email"
            placeholder="Digite o e-mail"
            registro={register('email', {
              required: 'E-mail é obrigatório',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Digite um e-mail válido',
              },
            })}
            erro={errors.email}
          />

          <Button
            type="submit"
            variant="enviar"
            className="w-full"
          >
            Enviar
          </Button>
        </form>
      </Card>
    </div>
  );

}

export default App;