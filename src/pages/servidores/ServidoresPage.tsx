import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Download, Filter, Plus, RotateCcw, Search, Users } from 'lucide-react';

import { api } from '../../services/api';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { CampoEntrada } from '../../components/Field';
import { FormGroup } from '../../components/FormGroup';
import { Indicator } from '../../components/Indicator';
import { CampoSelecao } from '../../components/Select';


type StatusServidor =
  | 'Ativo'
  | 'Normal'
  | 'INSS'
  | 'Férias'
  | 'Aposentado'
  | 'Exonerado'
  | 'Cedido Outra Secretaria'
  | 'Cedemos';

type Aba = 'todos' | 'ativos' | 'outros';

interface Referencia {
  _id: string;
  desc: string;
}

interface Servidor {
  _id: string;
  matricula: string;
  active: boolean;

  dadosPessoais: {
    nome: string;
    cpf: string;
  };

  lotacoes: {
    lotacaoId?: Referencia | null;
    funcaoId?: Referencia | null;
    dataTermino?: string | null;
  }[];

  status: {
    situacao: StatusServidor;
  }[];

  updatedAt: string;
}

interface Filtros {
  busca: string;
  unidade: string;
  funcao: string;
  status: string;
}



const valoresIniciais: Filtros = { busca: '', unidade: '', funcao: '', status: '' };
const porPagina = 8;
const inputClass = 'min-h-10 text-sm text-slate-800 placeholder:text-slate-400';


const variantesStatus: Record<
  StatusServidor,
  'success' | 'warning' | 'neutral' | 'info' | 'error'
> = {
  Ativo: 'success',
  Normal: 'success',
  INSS: 'warning',
  Férias: 'info',
  Aposentado: 'neutral',
  Exonerado: 'error',
  'Cedido Outra Secretaria': 'info',
  Cedemos: 'info',
};


function obterLotacaoAtual(servidor: Servidor) {
  return (
    servidor.lotacoes.filter((item) => !item.dataTermino).at(-1)
    ?? servidor.lotacoes.at(-1)
  );
}

function obterUnidade(servidor: Servidor) {
  return obterLotacaoAtual(servidor)?.lotacaoId?.desc ?? 'Não informada';
}

function obterFuncao(servidor: Servidor) {
  return obterLotacaoAtual(servidor)?.funcaoId?.desc ?? 'Não informada';
}

function obterStatus(servidor: Servidor) {
  return servidor.status.at(-1)?.situacao ?? 'Não informado';
}


function exportarCSV(servidores: Servidor[]) {
  const cabecalhos = ['Nome', 'Matrícula', 'CPF', 'Unidade / Lotação', 'Função', 'Status', 'Atualização'];

  const linhas = servidores.map((s) => [
    s.dadosPessoais.nome,
    s.matricula,
    s.dadosPessoais.cpf,
    obterUnidade(s),
    obterFuncao(s),
    obterStatus(s),
    s.updatedAt
      ? new Date(s.updatedAt).toLocaleString('pt-BR')
      : 'Não informada',
  ]);

  const escapar = (valor: string) => `"${valor.replace(/"/g, '""')}"`;
  const csv = '\uFEFF' + [cabecalhos, ...linhas].map((linha) => linha.map(escapar).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'servidores.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ServidoresPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<Filtros>({ defaultValues: valoresIniciais });
  const [filtros, setFiltros] = useState<Filtros>(valoresIniciais);
  const [aba, setAba] = useState<Aba>('todos');
  const [pagina, setPagina] = useState(1);
  const [servidorAberto, setServidorAberto] = useState<string | null>(null);


  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroServidores, setErroServidores] = useState('');

  useEffect(() => {
    async function carregarServidores() {
      try {
        const response = await api.get<Servidor[]>('/servidores');
        setServidores(response.data);
      } catch (error) {
        console.error('Erro ao carregar servidores:', error);
        setErroServidores('Não foi possível carregar os servidores.');
      } finally {
        setCarregando(false);
      }
    }

    carregarServidores();
  }, []);



  const unidades = useMemo(
    () => [...new Set(servidores.map(obterUnidade))]
      .filter((valor) => valor !== 'Não informada')
      .sort(),
    [servidores]
  );

  const funcoes = useMemo(
    () => [...new Set(servidores.map(obterFuncao))]
      .filter((valor) => valor !== 'Não informada')
      .sort(),
    [servidores]
  );

  const totalAtivos = servidores.filter((s) => s.active).length;
  const totalOutros = servidores.length - totalAtivos;



  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLocaleLowerCase('pt-BR');

    return servidores.filter((s) => {
      const correspondeBusca = !termo || [
        s.dadosPessoais.nome,
        s.matricula,
        s.dadosPessoais.cpf,
      ].some((campo) =>
        campo.toLocaleLowerCase('pt-BR').includes(termo)
      );

      const correspondeAba =
        aba === 'todos' ||
        (aba === 'ativos' ? s.active : !s.active);

      return (
        correspondeBusca &&
        correspondeAba &&
        (!filtros.unidade || obterUnidade(s) === filtros.unidade) &&
        (!filtros.funcao || obterFuncao(s) === filtros.funcao) &&
        (!filtros.status || obterStatus(s) === filtros.status)
      );
    });
  }, [servidores, filtros, aba]);


  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const itensPagina = filtrados.slice(inicio, inicio + porPagina);
  const filtrosAtivos = Object.values(filtros).some(Boolean) || aba !== 'todos';

  function aplicarFiltros(dados: Filtros) {
    setFiltros(dados);
    setPagina(1);
    setServidorAberto(null);
  }

  function limparFiltros() {
    reset(valoresIniciais);
    setFiltros(valoresIniciais);
    setAba('todos');
    setPagina(1);
    setServidorAberto(null);
  }

  function trocarAba(novaAba: Aba) {
    setAba(novaAba);
    setPagina(1);
    setServidorAberto(null);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-800 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-2 text-xs text-slate-500">Gestão de pessoas / Servidores</div>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Servidores</h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulte a base centralizada e acompanhe os vínculos de cada servidor.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="neutral" icon={Download} onClick={() => exportarCSV(filtrados)} disabled={filtrados.length === 0}>
              Exportar
            </Button>
            <Button variant="enviar" icon={Plus} onClick={() => navigate('/app/servidores/cadastro')}>
              Cadastrar servidor
            </Button>
          </div>
        </div>

        <div className="mb-5">
          <Card>
            <form onSubmit={handleSubmit(aplicarFiltros)}>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto] xl:items-start">
                <FormGroup label="Buscar servidor" htmlFor="busca">
                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                    <CampoEntrada
                      id="busca" placeholder="Nome, matrícula ou CPF"
                      className={`${inputClass} pl-9`} registro={register('busca')}
                    />
                  </div>
                </FormGroup>
                <FormGroup label="Unidade / Lotação" htmlFor="unidade">
                  <CampoSelecao id="unidade" className={inputClass} placeholder="Todas as unidades"
                    options={unidades.map((unidade) => ({ value: unidade, label: unidade }))}
                    registro={register('unidade')} />
                </FormGroup>
                <FormGroup label="Função" htmlFor="funcao">
                  <CampoSelecao id="funcao" className={inputClass} placeholder="Todas as funções"
                    options={funcoes.map((funcao) => ({ value: funcao, label: funcao }))}
                    registro={register('funcao')} />
                </FormGroup>
                <FormGroup label="Status" htmlFor="status">
                  <CampoSelecao id="status" className={inputClass} placeholder="Todos os status"
                    options={Object.keys(variantesStatus).map((status) => ({ value: status, label: status }))}
                    registro={register('status')} />
                </FormGroup>
                <div className="xl:pt-6">
                  <Button type="submit" variant="enviar" icon={Filter} className="w-full xl:w-auto">Filtrar</Button>
                </div>
              </div>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>{servidores.length} servidores em {unidades.length} unidades • {filtrosAtivos ? `${filtrados.length} resultado(s)` : 'Sem filtros aplicados'}</span>
              <button type="button" onClick={limparFiltros} className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline">
                <RotateCcw size={13} /> Limpar filtros
              </button>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-5 border-b border-slate-200">
            {([
              ['todos', `Todos os servidores (${servidores.length})`],
              ['ativos', `Ativos (${totalAtivos})`],
              ['outros', `Outros status (${totalOutros})`],
            ] as const).map(([valor, texto]) => (
              <button key={valor} type="button" onClick={() => trocarAba(valor)}
                className={`border-b-2 pb-3 text-sm transition-colors ${aba === valor ? 'border-teal-600 font-semibold text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                {texto}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="rounded-l-lg px-3 py-3 font-semibold">Servidor / Matrícula</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Unidade / Lotação</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Função</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Atualização</th>
                  <th scope="col" className="rounded-r-lg px-3 py-3 font-semibold"><span className="sr-only">Detalhes</span></th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Carregando servidores...
                    </td>
                  </tr>
                ) : erroServidores ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-red-600">
                      {erroServidores}
                    </td>
                  </tr>
                ) : itensPagina.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      <Users size={30} className="mx-auto mb-2 text-slate-300" />
                      Nenhum servidor encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  itensPagina.map((servidor) => (
                    <FragmentoServidor
                      key={servidor._id}
                      servidor={servidor}
                      aberto={servidorAberto === servidor._id}
                      alternar={() =>
                        setServidorAberto((atual) =>
                          atual === servidor._id ? null : servidor._id
                        )
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">
              {filtrados.length === 0 ? 'Nenhum servidor para exibir' : `Mostrando ${inicio + 1}–${Math.min(inicio + porPagina, filtrados.length)} de ${filtrados.length} servidores`}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="neutral" disabled={paginaAtual === 1} onClick={() => { setPagina((p) => p - 1); setServidorAberto(null); }}>
                Anterior
              </Button>
              <span className="rounded-md bg-teal-50 px-3 py-2 text-xs font-medium text-teal-700">
                {paginaAtual} / {totalPaginas}
              </span>
              <Button variant="neutral" disabled={paginaAtual === totalPaginas} onClick={() => { setPagina((p) => p + 1); setServidorAberto(null); }}>
                Próxima
              </Button>
            </div>
          </div>
        </Card>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <p>Dados fornecidos pela API • Autenticação simulada</p>
        </footer>
      </div>
    </main>
  );
}

// Mantido nesta página por enquanto. Pode virar um componente compartilhado quando houver outras tabelas.
function FragmentoServidor({ servidor, aberto, alternar }: {
  
  servidor: Servidor;
  aberto: boolean;
  alternar: () => void;
}) {
  const status = servidor.status.at(-1)?.situacao;
  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50/70">
        <td className="px-3 py-3">
          <span className="block font-semibold text-slate-800">{servidor.dadosPessoais.nome}</span>
          <span className="mt-0.5 block text-xs text-slate-500">Matrícula {servidor.matricula}</span>
        </td>
        <td className="px-3 py-3 text-slate-600">{obterUnidade(servidor)}</td>
        <td className="px-3 py-3 text-slate-600">{obterFuncao(servidor)}</td>
        <td className="px-3 py-3"><Indicator message={status ?? 'Não informado'} variant={status ? variantesStatus[status] : 'neutral'} /></td>
        <td className="px-3 py-3 text-xs text-slate-500">{servidor.updatedAt ? new Date(servidor.updatedAt).toLocaleString('pt-BR') : 'Não informada'}</td>
        <td className="px-3 py-3 text-right">
          <button type="button" onClick={alternar} aria-expanded={aberto} aria-label={`${aberto ? 'Ocultar' : 'Mostrar'} detalhes de ${servidor.dadosPessoais.nome}`}
            className="rounded-md p-2 text-teal-700 hover:bg-teal-50">
            {aberto ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
          </button>
        </td>
      </tr>
      {aberto && (
        <tr className="bg-slate-50/70">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div><span className="block text-xs text-slate-500">Nome completo</span><strong className="font-medium">{servidor.dadosPessoais.nome}</strong></div>
              <div><span className="block text-xs text-slate-500">CPF</span><strong className="font-medium">{servidor.dadosPessoais.cpf}</strong></div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
