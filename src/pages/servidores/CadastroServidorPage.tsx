import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Check, RotateCcw, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import axios from 'axios';

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

interface OpcaoCatalogo {
  _id: string;
  desc: string;
}

interface LotacaoCatalogo extends OpcaoCatalogo {
  diretoriaId?: OpcaoCatalogo | null;
}

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
  horarioInicio: string;
  horarioFim: string;
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

interface ServidorResposta {
  _id: string;
  matricula: string;
  dt_admissao: string;
  description?: string;
  area: string;
  conselho?: string;
  n_conselho?: string;
  active: boolean;
  e_ponto: boolean;

  dadosPessoais: {
    nome: string;
    cpf: string;
    rg: string;
    pis: string;
    cnh?: string;
    dataNascimento: string;
    genero: string;
  };

  contatos: {
    tel_1: string;
    tel_2?: string;
    p_email?: string;
    corp_email?: string;
  }[];

  endereco: {
    logradouro: string;
    numero: number;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };

  lotacoes: {
    lotacaoId?: OpcaoCatalogo | null;
    funcaoId?: OpcaoCatalogo | null;
    especialidadeId?: OpcaoCatalogo | null;
    diretoriaId?: OpcaoCatalogo | null;
    cargaHorariaSemanal: number;
    periodo: string;
    dataInicio: string;
    dataTermino?: string | null;
  }[];

  status: {
    situacao: string;
  }[];
}

// Valores padrão usados na inicialização do useForm e também no botão "Limpar" (reset).
const initialValues: ServidorFormData = {
  nome: '', cpf: '', rg: '', nascimento: '', genero: '', cnh: '',
  matricula: '', pis: '', dt_admissao: '', funcao: '',
  especialidade: '', area: '', diretoria: '', conselho: '',
  n_conselho: '', lotacao: '', c_horaria: '', horarioInicio: '', horarioFim: '',
  status: 'Normal', active: true, e_ponto: true,
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

function converterServidorParaFormulario(
  servidor: ServidorResposta
): ServidorFormData {
  const pessoal = servidor.dadosPessoais;
  const contato = servidor.contatos[0];
  const endereco = servidor.endereco;
  const lotacao = servidor.lotacoes[0];

  return {
    nome: pessoal.nome,
    cpf: maskCPF(pessoal.cpf),
    rg: pessoal.rg,
    nascimento: pessoal.dataNascimento.slice(0, 10),
    genero: pessoal.genero,
    cnh: pessoal.cnh || '',
    matricula: servidor.matricula,
    pis: maskPIS(pessoal.pis),

    dt_admissao: servidor.dt_admissao.slice(0, 10),
    funcao: lotacao?.funcaoId?._id || '',
    especialidade: lotacao?.especialidadeId?._id || '',
    area: servidor.area,
    diretoria: lotacao?.diretoriaId?._id || '',
    conselho: servidor.conselho || '',
    n_conselho: servidor.n_conselho || '',

    lotacao: lotacao?.lotacaoId?._id || '',
    c_horaria: String(lotacao?.cargaHorariaSemanal ?? ''),
    horarioInicio: lotacao?.periodo?.split(' às ')[0] || '',
    horarioFim: lotacao?.periodo?.split(' às ')[1] || '',
    dataInicioLotacao: lotacao?.dataInicio?.slice(0, 10) || '',
    dataTerminoLotacao: lotacao?.dataTermino?.slice(0, 10) || '',

    status: servidor.status.at(-1)?.situacao || 'Normal',
    active: servidor.active,
    e_ponto: servidor.e_ponto,

    tel_1: maskPhone(contato?.tel_1 || ''),
    tel_2: maskPhone(contato?.tel_2 || ''),
    p_email: contato?.p_email || '',
    co_email: contato?.corp_email || '',

    cep: maskCEP(endereco.cep),
    end: endereco.logradouro,
    n_end: String(endereco.numero),
    complemento: endereco.complemento || '',
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    uf: endereco.uf,

    description: servidor.description || '',
  };
}

export default function CadastroServidorPage() {
  // Controla a exibição do banner amarelo de confirmação após o submit.
  const [submitted, setSubmitted] = useState(false);

  const [erroCadastro, setErroCadastro] = useState('');

  const [catalogos, setCatalogos] = useState({
    funcoes: [] as OpcaoCatalogo[],
    especialidades: [] as OpcaoCatalogo[],
    lotacoes: [] as LotacaoCatalogo[],
  });

  const [carregandoCatalogos, setCarregandoCatalogos] = useState(true);

  useEffect(() => {
    async function carregarCatalogos() {
      try {
        const [funcoes, especialidades, lotacoes] =
          await Promise.all([
            api.get<OpcaoCatalogo[]>('/funcao'),
            api.get<OpcaoCatalogo[]>('/especialidade'),
            api.get<LotacaoCatalogo[]>('/lotacao'),
          ]);

        setCatalogos({
          funcoes: funcoes.data,
          especialidades: especialidades.data,
          lotacoes: lotacoes.data,
        });
      } catch (error) {
        console.error('Erro ao carregar catálogos:', error);

        setErroCatalogos(
          'Não foi possível carregar as opções do cadastro.'
        );
      } finally {
        setCarregandoCatalogos(false);
      }
    }

    carregarCatalogos();
  }, []);

  const [erroCatalogos, setErroCatalogos] = useState('');
  
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const modoEdicao = Boolean(id);

  const [carregandoServidor, setCarregandoServidor] =
    useState(modoEdicao);

  const [erroCarregamento, setErroCarregamento] =
    useState('');

  const [valoresOriginais, setValoresOriginais] =
    useState<ServidorFormData>(initialValues);

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
  const [
    nome,
    matricula,
    funcao,
    lotacao,
    active,
    cHoraria,
    horarioInicio,
    horarioFim,
  ] = watch([
    'nome',
    'matricula',
    'funcao',
    'lotacao',
    'active',
    'c_horaria',
    'horarioInicio',
    'horarioFim',
  ]);

  const horasTrabalhadas =
    horarioInicio && horarioFim
      ? `${horarioInicio} às ${horarioFim}`
      : '';

  useEffect(() => {
    if (!id) {
      reset(initialValues);
      setValoresOriginais(initialValues);
      setCarregandoServidor(false);
      setErroCarregamento('');
      return;
    }

    if (carregandoCatalogos || erroCatalogos) return;

    async function carregarServidor() {
      setCarregandoServidor(true);
      setErroCarregamento('');

      try {
        const response = await api.get<ServidorResposta>(
          `/servidores/${id}`
        );

        if (
          response.data.lotacoes.length !== 1 ||
          response.data.contatos.length !== 1
        ) {
          setErroCarregamento(
            'Este servidor possui uma estrutura de lotações ou contatos que não é compatível com o formulário de edição.'
          );
          return;
        }

        const valores = converterServidorParaFormulario(
          response.data
        );

        setValoresOriginais(valores);
        reset(valores);
      } catch (error) {
        console.error('Erro ao carregar servidor:', error);

        setErroCarregamento(
          'Não foi possível carregar os dados do servidor.'
        );
      } finally {
        setCarregandoServidor(false);
      }
    }

    carregarServidor();
  }, [id, reset, carregandoCatalogos, erroCatalogos]);  

  const lotacaoSelecionada = catalogos.lotacoes.find(
    (item) => item._id === lotacao
  );

  const diretoriaSelecionada = lotacaoSelecionada?.diretoriaId;

  useEffect(() => {
    setValue('diretoria', diretoriaSelecionada?._id || '');
  }, [diretoriaSelecionada, setValue]);

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

  const onSubmit = async (data: ServidorFormData) => {
    setSubmitted(false);
    setErroCadastro('');

    const diretoriaId = catalogos.lotacoes.find(
      (item) => item._id === data.lotacao
    )?.diretoriaId?._id;

    if (!diretoriaId) {
      setErroCadastro(
        'A lotação selecionada não possui uma diretoria vinculada.'
      );
      return;
    }

    try {
      const {
        dataInicioLotacao,
        dataTerminoLotacao,
        horarioInicio,
        horarioFim,
        ...root
      } = data;

      const payload = {
        ...root,
        diretoria: diretoriaId,
        c_horaria: Number(data.c_horaria),
        horas_trab: `${horarioInicio} às ${horarioFim}`,
        n_end: Number(data.n_end),
        cep: onlyDigits(data.cep, 8),
        dt_inicio: dataInicioLotacao,
        dt_termino: dataTerminoLotacao || null,
      };

      if (id) {
        await api.put(`/servidores/${id}`, payload);
        navigate('/app/servidores');
      } else {
        await api.post('/servidores', payload);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Erro ao cadastrar servidor:', error);

      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErroCadastro(
          error.response?.data?.message ||
          'Não foi possível cadastrar o servidor.'
        );
      } else {
        setErroCadastro('Erro inesperado ao cadastrar servidor.');
      }
    }
  };


  // Extrai as iniciais dos dois primeiros nomes do servidor para mostrar no avatar do resumo lateral.
  const initials = nome.trim()
    ? nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
    : 'SV';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-800 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-2 text-xs text-slate-500">
          Gestão de pessoas / Servidores / {modoEdicao
            ? 'Editar cadastro'
            : 'Novo cadastro'}
        </div>

        {/* Cabeçalho da página com botão de voltar usando o componente Button */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {modoEdicao ? 'Editar servidor' : 'Cadastrar servidor'}
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
          <Indicator
            message={modoEdicao
              ? 'Editando cadastro'
              : 'Novo cadastro • rascunho'}
            variant="warning"
          />
          <span className="text-xs text-slate-500">* Campos obrigatórios</span>
        </div>

        {/* Formulário principal conectado ao handleSubmit do react-hook-form */}

        {carregandoServidor && !erroCatalogos && (
          <p className="mb-4 text-sm text-slate-500">
            Carregando dados do servidor...
          </p>
        )}

        {erroCarregamento && (
          <div className="mb-4" role="alert">
            <Indicator
              size="banner"
              variant="error"
              message="Erro ao carregar servidor"
              description={erroCarregamento}
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset
            disabled={
              carregandoServidor ||
              carregandoCatalogos ||
              !!erroCarregamento ||
              !!erroCatalogos ||
              isSubmitting
            }
            className="min-w-0"
          >
            {/* Grid de 2 colunas no desktop: coluna principal para as seções e coluna lateral (280px) para o resumo */}
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex min-w-0 flex-col gap-5">

                {erroCatalogos && (
                  <p className="mb-4 text-sm text-red-600" role="alert">
                    {erroCatalogos}
                  </p>
                )}

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
                    <FormGroup label="CNH (opcional)" htmlFor="cnh">
                      <CampoEntrada id="cnh" placeholder="Número da CNH" className={fieldClass}
                        registro={register('cnh')} erro={errors.cnh} />
                    </FormGroup>
                    <FormGroup label="PIS" htmlFor="pis" required>
                      <CampoEntrada id="pis" inputMode="numeric" maxLength={14} placeholder="000.00000.00-0" className={fieldClass}
                        registro={register('pis', {
                          required: 'PIS é obrigatório',
                          pattern: { value: /^\d{3}\.\d{5}\.\d{2}-\d$/, message: 'Use 000.00000.00-0' },
                          onChange: formattedChange('pis', maskPIS),
                        })} erro={errors.pis} />
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

                    <FormGroup label="Data de admissão" htmlFor="dt_admissao" required>
                      <CampoEntrada id="dt_admissao" type="date" className={fieldClass}
                        registro={register('dt_admissao', { required: 'Data de admissão é obrigatória' })} erro={errors.dt_admissao} />
                    </FormGroup>

                    <FormGroup label="Função" htmlFor="funcao" required>
                      <CampoSelecao
                        id="funcao"
                        className={fieldClass}
                        placeholder="Selecione a função"
                        disabled={carregandoCatalogos}
                        options={catalogos.funcoes.map((item) => ({
                          value: item._id,
                          label: item.desc,
                        }))}
                        registro={register('funcao', {
                          required: 'Função é obrigatória',
                        })}
                        erro={errors.funcao}
                      />
                    </FormGroup>

                    <FormGroup label="Especialidade" htmlFor="especialidade" required>
                      <CampoSelecao
                        id="especialidade"
                        className={fieldClass}
                        placeholder="Selecione a especialidade"
                        disabled={carregandoCatalogos}
                        options={catalogos.especialidades.map((item) => ({
                          value: item._id,
                          label: item.desc,
                        }))}
                        registro={register('especialidade', {
                          required: 'Especialidade é obrigatória',
                        })}
                        erro={errors.especialidade}
                      />
                    </FormGroup>

                    <FormGroup label="Área" htmlFor="area" required>
                      <CampoEntrada
                        id="area"
                        placeholder="Ex.: Enfermagem"
                        className={fieldClass}
                        registro={register('area', {
                          required: 'Área é obrigatória'
                        })}
                        erro={errors.area}
                      />
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

                    <FormGroup
                      label="Lotação / unidade"
                      htmlFor="lotacao"
                      required
                      className="sm:col-span-2"
                    >
                      <CampoSelecao
                        id="lotacao"
                        className={fieldClass}
                        placeholder="Selecione a lotação"
                        disabled={carregandoCatalogos}
                        options={catalogos.lotacoes.map((item) => ({
                          value: item._id,
                          label: item.desc,
                        }))}
                        registro={register('lotacao', {
                          required: 'Lotação é obrigatória',
                          validate: (value) =>
                            !!catalogos.lotacoes.find(
                              (item) => item._id === value
                            )?.diretoriaId?._id ||
                            'A lotação selecionada não possui uma diretoria vinculada.',
                        })}
                        erro={errors.lotacao}
                      />
                    </FormGroup>

                    <FormGroup
                      label="Diretoria"
                      htmlFor="diretoria"
                      className="sm:col-span-2"
                    >
                      <input
                        type="hidden"
                        {...register('diretoria')}
                      />

                      <input
                        id="diretoria"
                        type="text"
                        readOnly
                        value={diretoriaSelecionada?.desc || ''}
                        placeholder="Preenchida conforme a lotação"
                        className="w-full min-h-10 mb-4 rounded border border-gray-300 bg-slate-100 p-2 text-sm text-slate-500"
                      />
                    </FormGroup>
                    
                    <FormGroup label="Carga horária semanal" htmlFor="c_horaria" required>
                      <CampoSelecao
                        id="c_horaria"
                        className={fieldClass}
                        placeholder="Selecione a carga horária"
                        options={[
                          { value: '20', label: '20 horas' },
                          { value: '30', label: '30 horas' },
                          { value: '40', label: '40 horas' },
                        ]}
                        registro={register('c_horaria', {
                          required: 'Carga horária é obrigatória',
                          validate: (value) =>
                            ['20', '30', '40'].includes(value) ||
                            'Selecione uma carga horária válida',
                        })}
                        erro={errors.c_horaria}
                      />
                    </FormGroup>
                    <FormGroup
                      label="Horas trabalhadas / horário"
                      htmlFor="horarioInicio"
                      required
                      className="sm:col-span-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <CampoEntrada
                            id="horarioInicio"
                            type="time"
                            aria-label="Horário de início"
                            className={fieldClass}
                            registro={register('horarioInicio', {
                              required: 'Informe o horário de início',
                            })}
                            erro={errors.horarioInicio}
                          />
                        </div>

                        <span className="pt-3 text-sm text-slate-500">
                          às
                        </span>

                        <div className="min-w-0 flex-1">
                          <CampoEntrada
                            id="horarioFim"
                            type="time"
                            aria-label="Horário de término"
                            className={fieldClass}
                            registro={register('horarioFim', {
                              required: 'Informe o horário de término',
                            })}
                            erro={errors.horarioFim}
                          />
                        </div>
                      </div>
                    </FormGroup>
                    <FormGroup label="Status administrativo" htmlFor="status" required>
                      <CampoSelecao
                        id="status"
                        className={fieldClass}
                        placeholder="Selecione o status"
                        options={[
                          { value: 'Normal', label: 'Normal' },
                          { value: 'INSS', label: 'INSS' },
                          { value: 'Férias', label: 'Férias' },
                          { value: 'Aposentado', label: 'Aposentado' },
                          { value: 'Exonerado', label: 'Exonerado' },
                          { value: 'Cedido Outra Secretaria', label: 'Cedido Outra Secretaria' },
                          { value: 'Cedemos', label: 'Cedemos' },
                        ]}
                        registro={register('status', {
                          required: 'Status é obrigatório'
                        })}
                        erro={errors.status}
                      />
                    </FormGroup>
                    <FormGroup label="Início na lotação" htmlFor="dataInicioLotacao" required>
                      <CampoEntrada
                        id="dataInicioLotacao"
                        type="date"
                        className={fieldClass}
                        registro={register('dataInicioLotacao', {
                          required: 'Início na lotação é obrigatório',
                        })}
                        erro={errors.dataInicioLotacao}
                      />
                    </FormGroup>

                    <FormGroup label="Término na lotação (opcional)" htmlFor="dataTerminoLotacao">
                      <CampoEntrada
                        id="dataTerminoLotacao"
                        type="date"
                        className={fieldClass}
                        registro={register('dataTerminoLotacao', {
                          validate: (value, form) =>
                            !value ||
                            value >= form.dataInicioLotacao ||
                            'O término não pode ser anterior ao início na lotação',
                        })}
                        erro={errors.dataTerminoLotacao}
                      />
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
                    <div><dt className="text-xs text-slate-500">Unidade de destino</dt><dd className="break-words">{catalogos.lotacoes.find((item) => item._id === lotacao)?.desc || 'Não informada'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Função</dt><dd className="break-words">{catalogos.funcoes.find((item) => item._id === funcao)?.desc || 'Não informada'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Carga horária</dt><dd>{cHoraria ? `${cHoraria}h semanais` : 'Não informada'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Horário</dt><dd className="break-words">{horasTrabalhadas || 'Não informado'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Diretoria</dt><dd className="break-words">{diretoriaSelecionada?.desc || 'Não informada'}</dd></div>
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
                <Button
                  type="button"
                  variant="neutral"
                  icon={RotateCcw}
                  onClick={() => {
                    reset(valoresOriginais);
                    setSubmitted(false);
                    setErroCadastro('');
                  }}
                >
                  {modoEdicao ? 'Restaurar dados' : 'Limpar'}
                </Button>
                <Button
                  type="submit"
                  variant="enviar"
                  icon={Check}
                  disabled={
                    isSubmitting ||
                    carregandoCatalogos ||
                    carregandoServidor ||
                    !!erroCatalogos ||
                    !!erroCarregamento
                  }
                >
                  {modoEdicao ? 'Salvar alterações' : 'Cadastrar servidor'}
                </Button>
              </div>
            </div>


            {submitted && (
              <div className="mt-3">
                <Indicator
                  size="banner"
                  variant="success"
                  message="Servidor cadastrado com sucesso!"
                  description="Os dados foram enviados e salvos pela API."
                />
              </div>
            )}

            {erroCadastro && (
              <div className="mt-3" role="alert">
                <Indicator
                  size="banner"
                  variant="error"
                  message={modoEdicao
                    ? 'Erro ao atualizar servidor'
                    : 'Erro ao cadastrar servidor'}
                  description={erroCadastro}
                />
              </div>
            )}
          </fieldset>
        </form>

        <footer className="mt-6 text-xs text-slate-400">Cadastro de servidores • RH Saúde</footer>
      </div>
    </main>
  );
}
