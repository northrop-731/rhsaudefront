import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Check, RotateCcw, UserRound } from 'lucide-react';

import Button from './components/Button';
import Card from './components/Card';
import { CampoEntrada } from './components/Field';
import { FormGroup } from './components/FormGroup';
import { FormSection } from './components/FormSection';
import { Indicator } from './components/Indicator';
import { CampoSelecao } from './components/Select';

// Campos do schema principal. O backend também define estruturas opcionais
// (dadosPessoais, contatos, endereco e lotacoes).
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

const initialValues: ServidorFormData = {
  nome: '', cpf: '', rg: '', nascimento: '', genero: '', cnh: '',
  matricula: '', pis: '', dt_admissao: '', funcao: '',
  especialidade: '', area: '', diretoria: '', conselho: '',
  n_conselho: '', lotacao: '', c_horaria: '', horas_trab: '',
  status: 'NORMAL', active: true, e_ponto: true,
  dataInicioLotacao: '', dataTerminoLotacao: '',
  tel_1: '', tel_2: '', p_email: '', co_email: '',
  cep: '', end: '', n_end: '', complemento: '',
  bairro: '', cidade: '', uf: '', description: '',
};

const onlyDigits = (text: string, limit: number) =>
  text.replace(/\D/g, '').slice(0, limit);

function maskCPF(text: string): string {
  const d = onlyDigits(text, 11);
  return d.slice(0, 3)
    + (d.length > 3 ? `.${d.slice(3, 6)}` : '')
    + (d.length > 6 ? `.${d.slice(6, 9)}` : '')
    + (d.length > 9 ? `-${d.slice(9)}` : '');
}

function maskPIS(text: string): string {
  const d = onlyDigits(text, 11);
  return d.slice(0, 3)
    + (d.length > 3 ? `.${d.slice(3, 8)}` : '')
    + (d.length > 8 ? `.${d.slice(8, 10)}` : '')
    + (d.length > 10 ? `-${d.slice(10)}` : '');
}

function maskPhone(text: string): string {
  const d = onlyDigits(text, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const split = d.length <= 10 ? 6 : 7;
  return `(${d.slice(0, 2)}) ${d.slice(2, split)}`
    + (d.length > split ? `-${d.slice(split)}` : '');
}

function maskCEP(text: string): string {
  const d = onlyDigits(text, 8);
  return d.slice(0, 5) + (d.length > 5 ? `-${d.slice(5)}` : '');
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fieldClass = 'min-h-10 text-sm text-slate-800 placeholder:text-slate-400';

export default function App() {
  const [submitted, setSubmitted] = useState(false);
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

  const [nome, matricula, funcao, lotacao, active, cHoraria, horasTrabalhadas] =
    watch(['nome', 'matricula', 'funcao', 'lotacao', 'active', 'c_horaria', 'horas_trab']);

  // Mantém as máscaras visíveis no input e sincronizadas ao React Hook Form.
  const formattedChange = (
    field: 'cpf' | 'pis' | 'tel_1' | 'tel_2' | 'cep',
    formatter: (value: string) => string,
  ) => (event: { target: { value: string } }) => {
    const result = formatter(event.target.value);
    event.target.value = result;
    setValue(field, result, { shouldDirty: true, shouldValidate: true });
  };

  // Exemplo de montagem de payload. Não faz POST: ainda faltam a rota
  // da API e a regra de origem do campo obrigatório c_custo.
  const onSubmit = (data: ServidorFormData) => {
    const { complemento, dataInicioLotacao, dataTerminoLotacao, ...root } = data;
    const payload = {
      ...root,
      matricula: Number(data.matricula),
      c_horaria: Number(data.c_horaria),
      n_end: Number(data.n_end),
      cep: Number(onlyDigits(data.cep, 8)),
      contatos: [
        { tipo: 'Celular', numero: data.tel_1, principal: true },
        ...(data.tel_2
          ? [{ tipo: 'Celular', numero: data.tel_2, principal: false }]
          : []),
      ],
      endereco: {
        logradouro: data.end,
        numero: Number(data.n_end),
        complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        cep: Number(onlyDigits(data.cep, 8)),
      },
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

    console.log('Prévia do payload (ainda sem c_custo):', payload);
    setSubmitted(true);
  };

  const initials = nome.trim()
    ? nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
    : 'SV';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-800 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-2 text-xs text-slate-500">
          Gestão de pessoas / Servidores / Novo cadastro
        </div>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Cadastrar servidor
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Preencha os dados pessoais e funcionais para incluir um servidor na base.
            </p>
          </div>
          <Button variant="neutral" icon={ArrowLeft} onClick={() => window.history.back()}>
            Voltar para servidores
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Indicator message="Novo cadastro • rascunho" variant="warning" />
          <span className="text-xs text-slate-500">* Campos obrigatórios</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex min-w-0 flex-col gap-5">
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
                  <FormGroup label="Área de atuação" htmlFor="area" required>
                    <CampoEntrada id="area" placeholder="Ex.: Enfermagem" className={fieldClass}
                      registro={register('area', { required: 'Área de atuação é obrigatória' })} erro={errors.area} />
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

              <FormSection title="Lotação e jornada" subtitle="Unidade, carga horária e situação administrativa">
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormGroup label="Lotação / unidade" htmlFor="lotacao" required className="sm:col-span-2">
                    <CampoEntrada id="lotacao" placeholder="Ex.: UBS Jardim Imperial" className={fieldClass}
                      registro={register('lotacao', { required: 'Lotação é obrigatória' })} erro={errors.lotacao} />
                  </FormGroup>
                  <FormGroup label="Carga horária semanal" htmlFor="c_horaria" required>
                    <CampoEntrada id="c_horaria" type="number" min={1} step={1} placeholder="40" className={fieldClass}
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
                  <FormGroup label="Término da lotação (opcional)" htmlFor="dataTerminoLotacao">
                    <CampoEntrada id="dataTerminoLotacao" type="date" className={fieldClass}
                      registro={register('dataTerminoLotacao', {
                        validate: (value, form) =>
                          !value || !!form.dataInicioLotacao || 'Informe também o início da lotação',
                      })} erro={errors.dataTerminoLotacao} />
                  </FormGroup>
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
                  description="Confira a unidade, a carga horária e a situação do servidor. As referências de lotação por ID dependem dos cadastros disponíveis na API." />
              </FormSection>

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
                    <CampoEntrada id="n_end" type="number" min={0} step={1} placeholder="Número" className={fieldClass}
                      registro={register('n_end', {
                        required: 'Número é obrigatório',
                        pattern: { value: /^\d+$/, message: 'Informe um número válido' },
                      })} erro={errors.n_end} />
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

              <FormSection title="Observações" subtitle="Informações complementares (opcional)">
                <FormGroup label="Descrição" htmlFor="description">
                  <CampoEntrada id="description" placeholder="Observações sobre o cadastro" className={fieldClass}
                    registro={register('description')} erro={errors.description} />
                </FormGroup>
              </FormSection>
            </div>

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
                  <div><dt className="text-xs text-slate-500">Função</dt><dd className="break-words">{funcao || 'Não informada'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Carga horária</dt><dd>{cHoraria ? `${cHoraria}h semanais` : 'Não informada'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Horário</dt><dd className="break-words">{horasTrabalhadas || 'Não informado'}</dd></div>
                </dl>
              </Card>
              <Indicator
                size="banner"
                variant="info"
                message="Cadastro sob gestão do RH"
                description="Os dados pessoais, a função, a lotação e o status podem ser administrados nesta tela. Os campos de classificação devem ser conciliados com os cadastros da API."
              />
            </aside>
          </div>

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
                description="O payload está no console. Para cadastrar, conecte a rota POST e resolva o campo c_custo, obrigatório no schema."
              />
            </div>
          )}
        </form>

        <footer className="mt-6 text-xs text-slate-400">Protótipo de cadastro • sem conexão com a API</footer>
      </div>
    </main>
  );
}
