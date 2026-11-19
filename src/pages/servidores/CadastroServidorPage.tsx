import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Check, RotateCcw, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importa os componentes visuais da pasta components para montar a página.
// A hierarquia visual funciona assim: FormSection (usa Card) -> FormGroup (usa Label) -> CampoEntrada / CampoSelecao.
import Button from '../../components/Button';
import Card from '../../components/Card';
import { CampoEntrada } from '../../components/Field';
import { FormGroup } from '../../components/FormGroup';
import { FormSection } from '../../components/FormSection';
import { Indicator } from '../../components/Indicator';
import { CampoSelecao } from '../../components/Select';

// Tipagem plana de todos os campos controlados pelo formulário.
// No momento do submit (onSubmit), esses dados planos são transformados e agrupados
// nas estruturas aninhadas que o backend espera (contatos, endereco e lotacoes).
interface ServidorFormData {
  nome: string;
  cpf: string;
  rg: string;
  nascimento: string;
  genero: string;
  cnh: string;
  matricula: string;
  pis: string;
  dt_admissao: string;
  funcao: string;
  especialidade: string;
  area: string;
  diretoria: string;
  conselho: string;
  n_conselho: string;
  lotacao: string;
  c_custo: string;
  c_horaria: string;
  horas_trab: string;
  status: string;
  active: boolean;
  e_ponto: boolean;
  dataInicioLotacao: string;
  dataTerminoLotacao: string;
  tel_1: string;
  tel_2: string;
  p_email: string;
  co_email: string;
  cep: string;
  end: string;
  n_end: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  description: string;
}

// Valores padrão usados na inicialização do useForm e também no botão "Limpar" (reset).
const initialValues: ServidorFormData = {
  nome: '', cpf: '', rg: '', nascimento: '', genero: '', cnh: '',
  matricula: '', pis: '', dt_admissao: '', funcao: '',
  especialidade: '', area: '', diretoria: '', conselho: '',
  n_conselho: '', lotacao: '', c_custo: '', c_horaria: '', horas_trab: '',
  status: 'NORMAL', active: true, e_ponto: true,
  dataInicioLotacao: '', dataTerminoLotacao: '',
  tel_1: '', tel_2: '', p_email: '', co_email: '',
  cep: '', end: '', n_end: '', complemento: '',
  bairro: '', cidade: '', uf: '', description: '',
};

// Função utilitária que remove tudo que não for dígito e limita a quantidade de caracteres.
// Serve de base para todas as funções de máscara abaixo.
const onlyDigits = (text: string, limit: number) =>
  text.replace(/\D/g, '').slice(0, limit);

// Aplica máscara de CPF: 000.000.000-00
function maskCPF(text: string): string {
  const d = onlyDigits(text, 11);
  return d.slice(0, 3)
    + (d.length > 3 ? `.${d.slice(3, 6)}` : '')
    + (d.length > 6 ? `.${d.slice(6, 9)}` : '')
    + (d.length > 9 ? `-${d.slice(9)}` : '');
}

// Aplica máscara de PIS: 000.00000.00-0
function maskPIS(text: string): string {
  const d = onlyDigits(text, 11);
  return d.slice(0, 3)
    + (d.length > 3 ? `.${d.slice(3, 8)}` : '')
    + (d.length > 8 ? `.${d.slice(8, 10)}` : '')
    + (d.length > 10 ? `-${d.slice(10)}` : '');
}

// Aplica máscara de telefone fixo (10 dígitos) ou celular (11 dígitos): (00) 00000-0000
function maskPhone(text: string): string {
  const d = onlyDigits(text, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const split = d.length <= 10 ? 6 : 7;
  return `(${d.slice(0, 2)}) ${d.slice(2, split)}`
    + (d.length > split ? `-${d.slice(split)}` : '');
}

// Aplica máscara de CEP: 00000-000
function maskCEP(text: string): string {
  const d = onlyDigits(text, 8);
  return d.slice(0, 5) + (d.length > 5 ? `-${d.slice(5)}` : '');
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fieldClass = 'min-h-10 text-sm text-slate-800 placeholder:text-slate-400';

export default function CadastroServidorPage() {
  // Controla a exibição do banner amarelo de confirmação após o submit.
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  // Inicializa o react-hook-form com validação em tempo real (mode: 'onChange').
  // O objeto 'errors' é repassado para cada CampoEntrada/CampoSelecao para exibir erros de validação.
  const {
    register,
    setValue,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServidorFormData>({
    mode: 'onChange',
    defaultValues: initialValues,
  });

  // Observa em tempo real os campos principais para atualizar o Card lateral de "Resumo do cadastro"
  // conforme o usuário digita no formulário.
  const [nome, matricula, funcao, lotacao, centroCusto, active, cHoraria, horasTrabalhadas] =
    watch(['nome', 'matricula', 'funcao', 'lotacao', 'c_custo', 'active', 'c_horaria', 'horas_trab']);

  // Intercepta o evento onChange dos campos com máscara, formata o valor no elemento HTML
  // e sincroniza o resultado no estado do react-hook-form disparando a validação em seguida.
  const formattedChange = (
    field: 'cpf' | 'pis' | 'tel_1' | 'tel_2' | 'cep',
    formatter: (value: string) => string,
  ) => (event: { target: { value: string } }) => {
    const result = formatter(event.target.value);
    event.target.value = result;
    setValue(field, result, { shouldDirty: true, shouldValidate: true });
  };

  // Executado quando o formulário passa por todas as validações e o usuário clica em "Cadastrar servidor".
  // Converte campos numéricos e agrupa os dados planos em objetos/arrays aninhados para a API.
  const onSubmit = (data: ServidorFormData) => {
    const { complemento, dataInicioLotacao, dataTerminoLotacao, ...root } = data;
    const payload = {
      ...root,
      matricula: Number(data.matricula),
      c_horaria: Number(data.c_horaria),
      n_end: Number(data.n_end),
      cep: Number(onlyDigits(data.cep, 8)),
      // Agrupa os telefones em um array de objetos, incluindo o secundário apenas se preenchido
      contatos: [
        { tipo: 'Celular', numero: data.tel_1, principal: true },
        ...(data.tel_2
          ? [{ tipo: 'Celular', numero: data.tel_2, principal: false }]
          : []),
      ],
      // Monta o objeto estruturado de endereço
      endereco: {
        logradouro: data.end,
        numero: Number(data.n_end),
        complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        cep: Number(onlyDigits(data.cep, 8)),
      },
      // Inclui o histórico inicial de lotação apenas se a data de início for informada
      ...(dataInicioLotacao
        ? {
            lotacoes: [{
              cargaHorariaSemanal: Number(data.c_horaria),
              horasTrabalhadas: data.horas_trab,
              status: data.active ? 'ATIVO' : 'INATIVO',
              dataInicio: dataInicioLotacao,
              dataTermino: dataTerminoLotacao || null,
            }],
          }
        : {}),
    };

    console.log('Prévia do payload:', payload);
    setSubmitted(true);
  };

  // Extrai as iniciais dos dois primeiros nomes do servidor para mostrar no avatar do resumo lateral.
  const initials = nome.trim()
    ? nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
    : 'SV';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-800 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-2 text-xs text-slate-500">
          Gestão de pessoas / Servidores / Novo cadastro
        </div>

        {/* Cabeçalho da página com botão de voltar usando o componente Button */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Cadastrar servidor
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Preencha os dados pessoais e funcionais para incluir um servidor na base.
            </p>
          </div>
          <Button variant="neutral" icon={ArrowLeft} onClick={() => navigate('/app/servidores')}>
            Voltar para servidores
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Indicator message="Novo cadastro • rascunho" variant="warning" />
          <span className="text-xs text-slate-500">* Campos obrigatórios</span>
        </div>

        {/* Formulário principal conectado ao handleSubmit do react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Grid de 2 colunas no desktop: coluna principal para as seções e coluna lateral (280px) para o resumo */}
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex min-w-0 flex-col gap-5">
              {/* Seção 1: Dados pessoais */}
              <FormSection title="Dados pessoais" subtitle="Identificação e dados cadastrais do servidor">
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormGroup label="Nome completo" htmlFor="nome" required className="sm:col-span-2 lg:col-span-3">
                    <CampoEntrada id="nome" placeholder="Nome completo" className={fieldClass}
                      registro={register('nome', { required: 'Nome é obrigatório' })}
                      erro={errors.nome} />
                  </FormGroup>
                  <FormGroup label="CPF" htmlFor="cpf" required>
                    <CampoEntrada id="cpf" placeholder="000.000.000-00" inputMode="numeric" maxLength={14} className={fieldClass}
                      registro={register('cpf', {
                        required: 'CPF é obrigatório',
                        pattern: { value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, message: 'Use 000.000.000-00' },
                        onChange: formattedChange('cpf', maskCPF),
                      })} erro={errors.cpf} />
                  </FormGroup>
                  <FormGroup label="RG" htmlFor="rg" required>
                    <CampoEntrada id="rg" placeholder="RG" className={fieldClass}
                      registro={register('rg', { required: 'RG é obrigatório' })} erro={errors.rg} />
                  </FormGroup>
                  <FormGroup label="Data de nascimento" htmlFor="nascimento" required>
                    <CampoEntrada id="nascimento" type="date" className={fieldClass}
                      registro={register('nascimento', { required: 'Data de nascimento é obrigatória' })} erro={errors.nascimento} />
                  </FormGroup>
                  <FormGroup label="Gênero" htmlFor="genero" required>
                    <CampoSelecao id="genero" className={fieldClass}
                      placeholder="Selecione"
                      options={[
                        { value: 'Feminino', label: 'Feminino' },
                        { value: 'Masculino', label: 'Masculino' },
                        { value: 'Outro', label: 'Outro' },
                        { value: 'Não informado', label: 'Prefiro não informar' },
                      ]}
                      registro={register('genero', { required: 'Gênero é obrigatório' })} erro={errors.genero} />
                  </FormGroup>
                  <FormGroup label="CNH (opcional)" htmlFor="cnh" className="sm:col-span-1 lg:col-span-2">
                    <CampoEntrada id="cnh" placeholder="Número da CNH" className={fieldClass}
                      registro={register('cnh')} erro={errors.cnh} />
                  </FormGroup>
                </div>
              </FormSection>

              {/* Seção 2: Dados funcionais */}
              <FormSection title="Dados funcionais" subtitle="Informações de vínculo e identificação funcional">
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormGroup label="Matrícula" htmlFor="matricula" required>
                    <CampoEntrada id="matricula" inputMode="numeric" placeholder="Ex.: 004249" className={fieldClass}
                      registro={register('matricula', {
                        required: 'Matrícula é obrigatória',
                        pattern: { value: /^\d+$/, message: 'Use apenas números' },
                      })} erro={errors.matricula} />
                  </FormGroup>
                  <FormGroup label="PIS" htmlFor="pis" required>
                    <CampoEntrada id="pis" inputMode="numeric" maxLength={14} placeholder="000.00000.00-0" className={fieldClass}
                      registro={register('pis', {
                        required: 'PIS é obrigatório',
                        pattern: { value: /^\d{3}\.\d{5}\.\d{2}-\d$/, message: 'Use 000.00000.00-0' },
                        onChange: formattedChange('pis', maskPIS),
                      })} erro={errors.pis} />
                  </FormGroup>
                  <FormGroup label="Data de admissão" htmlFor="dt_admissao" required>
                    <CampoEntrada id="dt_admissao" type="date" className={fieldClass}
                      registro={register('dt_admissao', { required: 'Data de admissão é obrigatória' })} erro={errors.dt_admissao} />
                  </FormGroup>
                  <FormGroup label="Função" htmlFor="funcao" required>
                    <CampoEntrada id="funcao" placeholder="Ex.: Técnica de enfermagem" className={fieldClass}
                      registro={register('funcao', { required: 'Função é obrigatória' })} erro={errors.funcao} />
                  </FormGroup>
                  <FormGroup label="Especialidade" htmlFor="especialidade" required>
                    <CampoEntrada id="especialidade" placeholder="Especialidade" className={fieldClass}
                      registro={register('especialidade', { required: 'Especialidade é obrigatória' })} erro={errors.especialidade} />
                  </FormGroup>
                  <FormGroup label="Diretoria" htmlFor="diretoria" required>
                    <CampoEntrada id="diretoria" placeholder="Diretoria" className={fieldClass}
                      registro={register('diretoria', { required: 'Diretoria é obrigatória' })} erro={errors.diretoria} />
                  </FormGroup>
                  <FormGroup label="Conselho profissional (opcional)" htmlFor="conselho">
                    <CampoEntrada id="conselho" placeholder="Ex.: COREN" className={fieldClass}
                      registro={register('conselho')} erro={errors.conselho} />
                  </FormGroup>
                  <FormGroup label="Número do conselho (opcional)" htmlFor="n_conselho">
                    <CampoEntrada id="n_conselho" placeholder="Número de registro" className={fieldClass}
                      registro={register('n_conselho')} erro={errors.n_conselho} />
                  </FormGroup>
                </div>
              </FormSection>

              {/* Seção 3: Lotação e jornada */}
              <FormSection title="Lotação e jornada" subtitle="Unidade, carga horária e situação administrativa">
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormGroup label="Lotação / unidade" htmlFor="lotacao" required className="sm:col-span-2">
                    <CampoEntrada id="lotacao" placeholder="Ex.: UBS Jardim Imperial" className={fieldClass}
                      registro={register('lotacao', { required: 'Lotação é obrigatória' })} erro={errors.lotacao} />
                  </FormGroup>
                  
                  <FormGroup label="Carga horária semanal" htmlFor="c_horaria" required>
                    <CampoEntrada id="c_horaria" type="number" min={0} step={10} placeholder="0" className={fieldClass}
                      registro={register('c_horaria', {
                        required: 'Carga horária é obrigatória',
                        validate: (value) => Number(value) > 0 || 'Informe um número maior que zero',
                      })} erro={errors.c_horaria} />
                  </FormGroup>
                  <FormGroup label="Horas trabalhadas / horário" htmlFor="horas_trab" required>
                    <CampoEntrada id="horas_trab" placeholder="Ex.: 07:00 às 16:00" className={fieldClass}
                      registro={register('horas_trab', { required: 'Horário é obrigatório' })} erro={errors.horas_trab} />
                  </FormGroup>
                  <FormGroup label="Status administrativo" htmlFor="status" required>
                    <CampoEntrada id="status" placeholder="NORMAL" className={fieldClass}
                      registro={register('status', { required: 'Status é obrigatório' })} erro={errors.status} />
                  </FormGroup>
                  <FormGroup label="Início da lotação (opcional)" htmlFor="dataInicioLotacao">
                    <CampoEntrada id="dataInicioLotacao" type="date" className={fieldClass}
                      registro={register('dataInicioLotacao')} erro={errors.dataInicioLotacao} />
                  </FormGroup>
                  {/* Validação cruzada: exige dataInicioLotacao caso o usuário preencha dataTerminoLotacao */}
                  <FormGroup label="Término da lotação (opcional)" htmlFor="dataTerminoLotacao">
                    <CampoEntrada id="dataTerminoLotacao" type="date" className={fieldClass}
                      registro={register('dataTerminoLotacao', {
                        validate: (value, form) =>
                          !value || !!form.dataInicioLotacao || 'Informe também o início da lotação',
                      })} erro={errors.dataTerminoLotacao} />
                  </FormGroup>
                  {/* Checkboxes booleanos controlados diretamente pelo register */}
                  <div className="flex flex-wrap items-center gap-6 pb-4 sm:col-span-2 lg:col-span-3">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="size-4 accent-teal-600" {...register('active')} />
                      Servidor ativo
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="size-4 accent-teal-600" {...register('e_ponto')} />
                      Controle de ponto
                    </label>
                  </div>
                </div>
                <Indicator size="banner" variant="info"
                  message="Informações de lotação"
                  description="Confira a unidade, a carga horária e a situação do servidor." />
              </FormSection>

              {/* Seção 4: Contato */}
              <FormSection title="Contato" subtitle="Telefones e endereços de e-mail">
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <FormGroup label="Telefone principal" htmlFor="tel_1" required>
                    <CampoEntrada id="tel_1" type="tel" inputMode="tel" maxLength={15} placeholder="(11) 90000-0000" className={fieldClass}
                      registro={register('tel_1', {
                        required: 'Telefone é obrigatório',
                        validate: (value) => [10, 11].includes(onlyDigits(value, 11).length) || 'Informe DDD e número',
                        onChange: formattedChange('tel_1', maskPhone),
                      })} erro={errors.tel_1} />
                  </FormGroup>
                  <FormGroup label="Telefone secundário (opcional)" htmlFor="tel_2">
                    <CampoEntrada id="tel_2" type="tel" inputMode="tel" maxLength={15} placeholder="(11) 90000-0000" className={fieldClass}
                      registro={register('tel_2', {
                        validate: (value) => !value || [10, 11].includes(onlyDigits(value, 11).length) || 'Informe DDD e número',
                        onChange: formattedChange('tel_2', maskPhone),
                      })} erro={errors.tel_2} />
                  </FormGroup>
                  <FormGroup label="E-mail pessoal (opcional)" htmlFor="p_email">
                    <CampoEntrada id="p_email" type="email" placeholder="nome@exemplo.com" className={fieldClass}
                      registro={register('p_email', {
                        validate: (value) => !value || emailPattern.test(value) || 'Digite um e-mail válido',
                      })} erro={errors.p_email} />
                  </FormGroup>
                  <FormGroup label="E-mail corporativo (opcional)" htmlFor="co_email">
                    <CampoEntrada id="co_email" type="email" placeholder="nome@instituicao.gov.br" className={fieldClass}
                      registro={register('co_email', {
                        validate: (value) => !value || emailPattern.test(value) || 'Digite um e-mail válido',
                      })} erro={errors.co_email} />
                  </FormGroup>
                </div>
              </FormSection>

              {/* Seção 5: Endereço */}
              <FormSection title="Endereço" subtitle="Localização residencial do servidor">
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormGroup label="CEP" htmlFor="cep" required>
                    <CampoEntrada id="cep" inputMode="numeric" maxLength={9} placeholder="00000-000" className={fieldClass}
                      registro={register('cep', {
                        required: 'CEP é obrigatório',
                        pattern: { value: /^\d{5}-\d{3}$/, message: 'Use 00000-000' },
                        onChange: formattedChange('cep', maskCEP),
                      })} erro={errors.cep} />
                  </FormGroup>
                  <FormGroup label="Logradouro" htmlFor="end" required className="sm:col-span-2 lg:col-span-2">
                    <CampoEntrada id="end" placeholder="Rua, avenida..." className={fieldClass}
                      registro={register('end', { required: 'Logradouro é obrigatório' })} erro={errors.end} />
                  </FormGroup>
                  <FormGroup label="Número" htmlFor="n_end" required>
                    <CampoEntrada
                      id="n_end"
                      type="text"
                      inputMode="numeric"
                      placeholder="Número"
                      className={fieldClass}
                      registro={register('n_end', {
                        required: 'Número é obrigatório',
                        pattern: {
                        value: /^\d+$/,
                        message: 'Informe um número válido',
                        },
                      })}
                    erro={errors.n_end}
                  />
                  </FormGroup>
                  <FormGroup label="Complemento (opcional)" htmlFor="complemento">
                    <CampoEntrada id="complemento" placeholder="Apartamento, bloco..." className={fieldClass}
                      registro={register('complemento')} erro={errors.complemento} />
                  </FormGroup>
                  <FormGroup label="Bairro" htmlFor="bairro" required>
                    <CampoEntrada id="bairro" placeholder="Bairro" className={fieldClass}
                      registro={register('bairro', { required: 'Bairro é obrigatório' })} erro={errors.bairro} />
                  </FormGroup>
                  <FormGroup label="Cidade" htmlFor="cidade" required>
                    <CampoEntrada id="cidade" placeholder="Cidade" className={fieldClass}
                      registro={register('cidade', { required: 'Cidade é obrigatória' })} erro={errors.cidade} />
                  </FormGroup>
                  {/* Converte automaticamente a sigla do estado para letras maiúsculas durante a digitação */}
                  <FormGroup label="UF" htmlFor="uf" required>
                    <CampoEntrada id="uf" maxLength={2} placeholder="SP" className={fieldClass}
                      registro={register('uf', {
                        required: 'UF é obrigatória',
                        pattern: { value: /^[A-Za-z]{2}$/, message: 'Use duas letras' },
                        onChange: (event) => {
                          const value = String(event.target.value).toUpperCase().slice(0, 2);
                          event.target.value = value;
                          setValue('uf', value, { shouldDirty: true, shouldValidate: true });
                        },
                      })} erro={errors.uf} />
                  </FormGroup>
                </div>
              </FormSection>

              {/* Seção 6: Observações */}
              <FormSection title="Observações" subtitle="Informações complementares (opcional)">
                <FormGroup label="Descrição" htmlFor="description">
                  <CampoEntrada id="description" placeholder="Observações sobre o cadastro" className={fieldClass}
                    registro={register('description')} erro={errors.description} />
                </FormGroup>
              </FormSection>
            </div>

            {/* Painel lateral fixo (sticky) que exibe em tempo real os dados monitorados via watch() */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-5">
              <Card>
                <h2 className="mb-4 text-base font-semibold">Resumo do cadastro</h2>
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-blue-50 text-base font-semibold text-cyan-700">
                  {initials || <UserRound size={20} />}
                </div>
                <p className="mb-2 break-words font-semibold text-slate-800">
                  {nome?.trim() || 'Nome do servidor'}
                </p>
                <Indicator message={active ? 'Ativo' : 'Inativo'} variant={active ? 'success' : 'error'} />
                <div className="my-5 border-t border-slate-200" />
                <dl className="space-y-4 text-sm">
                  <div><dt className="text-xs text-slate-500">Matrícula</dt><dd>{matricula || 'Não informada'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Unidade de destino</dt><dd className="break-words">{lotacao || 'Não informada'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Centro de custo</dt><dd className="break-words">{centroCusto || 'Não informado'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Função</dt><dd className="break-words">{funcao || 'Não informada'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Carga horária</dt><dd>{cHoraria ? `${cHoraria}h semanais` : 'Não informada'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Horário</dt><dd className="break-words">{horasTrabalhadas || 'Não informado'}</dd></div>
                </dl>
              </Card>
              <Indicator
                size="banner"
                variant="info"
                message="Cadastro sob gestão do RH"
                description="Os dados pessoais, a função, a lotação e o status podem ser administrados nesta tela."
              />
            </aside>
          </div>

          {/* Barra inferior de ações: botão Limpar restaura os initialValues e botão Cadastrar dispara o onSubmit */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-500">Confira os dados antes de concluir o cadastro.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="neutral" icon={RotateCcw}
                onClick={() => { reset(initialValues); setSubmitted(false); }}>
                Limpar
              </Button>
              <Button type="submit" variant="enviar" icon={Check} disabled={isSubmitting}>
                Cadastrar servidor
              </Button>
            </div>
          </div>
          {submitted && (
            <div className="mt-3">
              <Indicator
                size="banner"
                variant="warning"
                message="Formulário validado (sem envio à API)"
                description="O payload, incluindo c_custo, está no console. Para cadastrar, conecte a rota POST da API."
              />
            </div>
          )}
        </form>

        <footer className="mt-6 text-xs text-slate-400">Protótipo de cadastro • sem conexão com a API</footer>
      </div>
    </main>
  );
}
