// src/DashboardProfissional.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import './App.css';

const DashboardProfissional = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('meusClientes');
  const [clienteDevolutiva, setClienteDevolutiva] = useState(null);
  
  // Novos estados para a busca e distribuição de tipos
  const [busca, setBusca] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [tipoDistribuicao, setTipoDistribuicao] = useState({ NO: 0, SO: 0, NE: 0, SE: 0 });

  // useEffect original para buscar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        
        // Buscar clientes do profissional
        const response = await axios.get('http://localhost:5000/api/clientes');
        
        const clientesData = response.data.data || [];
        setClientes(clientesData);
        
        // Se tiver clientes e não tiver cliente selecionado para devolutiva, seleciona o primeiro
        if (clientesData.length > 0 && !clienteDevolutiva) {
          setClienteDevolutiva(clientesData[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar clientes:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchClientes();
    }
  }, [user, clienteDevolutiva]);

  // Novo useEffect para filtragem de clientes
  useEffect(() => {
    if (!clientes) return;
    
    // Filtrar clientes baseado na busca
    if (busca.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const termo = busca.toLowerCase();
      const filtrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(termo) ||
        (cliente.email && cliente.email.toLowerCase().includes(termo)) ||
        (cliente.telefone && cliente.telefone.includes(termo))
      );
      setClientesFiltrados(filtrados);
    }
  }, [busca, clientes]);

  // Novo useEffect para calcular distribuição de tipos
  useEffect(() => {
    // Calcular distribuição de tipos predominantes
    if (clientes && clientes.length > 0) {
      const distribuicao = { NO: 0, SO: 0, NE: 0, SE: 0 };
      
      clientes.forEach(cliente => {
        if (cliente.questionario && cliente.questionario.resultado) {
          const tipo = cliente.questionario.resultado.tipoPredominante;
          if (tipo && distribuicao[tipo] !== undefined) {
            distribuicao[tipo]++;
          }
        }
      });
      
      setTipoDistribuicao(distribuicao);
    }
  }, [clientes]);


  // Formatação de data
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Carregar dados do questionário do cliente
  const carregarQuestionarioCliente = async (clienteId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`http://localhost:5000/api/clientes/${clienteId}/questionario`);
      
      if (response.data.success) {
        // Atualizar o cliente com os dados do questionário
        const clienteComQuestionario = {
          ...clienteDevolutiva,
          questionario: response.data.data
        };
        
        setClienteDevolutiva(clienteComQuestionario);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar questionário:', error);
      setLoading(false);
    }
  };
  
  // Quando o cliente selecionado para devolutiva mudar, carregue o questionário
  useEffect(() => {
    if (clienteDevolutiva && clienteDevolutiva._id) {
      carregarQuestionarioCliente(clienteDevolutiva._id);
    }
  }, [clienteDevolutiva?._id]);
  
  // Determinar o tipo predominante do cliente
  const determinarTipoPredominante = (cliente) => {
    if (!cliente || !cliente.questionario || !cliente.questionario.resultado) {
      return 'N/A';
    }
    
    return cliente.questionario.resultado.tipoPredominante || 'N/A';
  };
  
  // Interpretar o tipo predominante
  const interpretarTipoPredominante = (tipo) => {
    switch(tipo) {
      case 'NO':
        return "RACIONAL/TÉCNICO - Forte aptidão para trabalhos técnicos, análise lógica e resolução de problemas. Prefere trabalhar com dados concretos e objetivos, buscando eficiência e resultados práticos.";
      case 'SO':
        return "ORGANIZADOR/DETALHISTA - Forte aptidão para organização, planejamento e trabalho metódico. Valoriza a ordem, disciplina e estrutura, destacando-se em tarefas que exigem atenção aos detalhes e procedimentos bem definidos.";
      case 'NE':
        return "CRIATIVO/INOVADOR - Forte aptidão para atividades criativas, inovação e pensamento conceitual. Prefere ambientes dinâmicos que permitam liberdade para experimentar novas ideias e soluções originais.";
      case 'SE':
        return "SOCIAL/EMOCIONAL - Forte aptidão para interações sociais, comunicação e trabalho em equipe. É sensível às necessidades dos outros, destacando-se em atividades que envolvem relacionamentos interpessoais e expressão emocional.";
      default:
        return "Perfil equilibrado com características diversas.";
    }
  };
  
  // Gerar recomendações com base no tipo predominante
  const gerarRecomendacoes = (tipo) => {
    // Verificação adicional para valores zero
    const todosZeros = clienteSelecionado?.questionario?.resultado &&
    clienteSelecionado.questionario.resultado.NO === 0 &&
    clienteSelecionado.questionario.resultado.SO === 0 &&
    clienteSelecionado.questionario.resultado.NE === 0 &&
    clienteSelecionado.questionario.resultado.SE === 0;
    
    if (todosZeros) {
      return ["Por favor, verifique o questionário. Parece haver um problema com os resultados."];
    }
    switch(tipo) {
      case 'NO':
        return [
          "Oferecer estrutura e planejamento definidos",
          "Utilizar abordagens baseadas em evidências",
          "Apresentar dados e análises detalhadas",
          "Estabelecer metas mensuráveis e específicas"
        ];
      case 'SO':
        return [
          "Fornecer instruções claras e detalhadas",
          "Estabelecer processos estruturados",
          "Reconhecer o valor da precisão e consistência",
          "Manter ambiente organizado e previsível"
        ];
      case 'NE':
        return [
          "Estimular pensamento inovador e criativo",
          "Permitir flexibilidade na abordagem",
          "Conectar conceitos e ideias de forma ampla",
          "Valorizar soluções não convencionais"
        ];
      case 'SE':
        return [
          "Priorizar o desenvolvimento de conexões pessoais",
          "Valorizar a expressão de sentimentos e emoções",
          "Criar ambiente seguro para compartilhamento",
          "Utilizar dinâmicas em grupo quando possível"
        ];
      default:
        return [
          "Equilibrar abordagens estruturadas e flexíveis",
          "Combinar elementos analíticos e práticos",
          "Alternar entre trabalho individual e colaborativo",
          "Adaptar a comunicação conforme necessário"
        ];
    }
  };
  

  // Modal para visualizar detalhes do cliente
  const ModalDetalhesCliente = () => {
    if (!clienteSelecionado) return null;
    
    // Estado local para as observações do profissional
    const [observacoesAtendimento, setObservacoesAtendimento] = useState('');
    const [valorAtendimento, setValorAtendimento] = useState(
      (clienteSelecionado.valorAtendimento || 150).toString()
    );
    const [enviandoDados, setEnviandoDados] = useState(false);
    
    // Função para alternar atendimento ao clicar nos círculos
    const toggleAtendimento = async (index) => {
      try {
        setEnviandoDados(true);
        
        const clienteAtualizado = { ...clienteSelecionado };
        
        if (!clienteAtualizado.atendimentos) {
          clienteAtualizado.atendimentos = [];
        }
        
        // Se já tem atendimentos suficientes, remover o último
        if (clienteAtualizado.atendimentos.length > index) {
          if (confirm("Deseja remover este atendimento?")) {
            // Remover no backend
            await axios.delete(`http://localhost:5000/api/clientes/${clienteSelecionado._id}/atendimentos/ultimo`);
            
            // Atualizar frontend
            clienteAtualizado.atendimentos.splice(index);
          } else {
            setEnviandoDados(false);
            return; // Cancelou a remoção
          }
        } else if (clienteAtualizado.atendimentos.length === index) {
          // Adicionar um novo atendimento com o valor definido
          const valorNumerico = parseInt(valorAtendimento) || 150;
          
          // Adicionar no backend
          const response = await axios.post(`http://localhost:5000/api/clientes/${clienteSelecionado._id}/atendimentos`, {
            observacoes: observacoesAtendimento || 'Atendimento registrado',
            valor: valorNumerico
          });
          
          // Se deu certo, atualizar o frontend com os dados exatos do servidor
          if (response.data.success) {
            clienteAtualizado.atendimentos = response.data.data.atendimentos;
          } else {
            throw new Error('Falha ao registrar atendimento');
          }
        } else {
          // Tentando adicionar um atendimento no meio, não permitido
          alert("Você só pode adicionar atendimentos em sequência");
          setEnviandoDados(false);
          return;
        }
        
        // Atualizar o cliente selecionado
        setClienteSelecionado(clienteAtualizado);
        
        // Atualizar a lista de clientes
        setClientes(clientes.map(c => 
          c._id === clienteAtualizado._id ? clienteAtualizado : c
        ));
        
        setObservacoesAtendimento(''); // Limpar observações após registrar
        setEnviandoDados(false);
      } catch (error) {
        console.error('Erro ao atualizar atendimentos:', error);
        alert('Erro ao registrar atendimento. Por favor, tente novamente.');
        setEnviandoDados(false);
      }
    };
    
    // Função para atualizar o valor do atendimento
    const atualizarValorAtendimento = async (valorString) => {
      // Atualizar o estado local (mantendo como string para o input)
      setValorAtendimento(valorString);
      
      // Converter para número para armazenar no cliente
      const valorNumerico = parseInt(valorString) || 0;
      
      try {
        setEnviandoDados(true);
        
        // Enviar o valor para o servidor
        await axios.put(`http://localhost:5000/api/clientes/${clienteSelecionado._id}/valor-atendimento`, {
          valorAtendimento: valorNumerico
        });
        
        // Se a requisição for bem-sucedida, atualizar a lista de clientes
        setClientes(prevClientes => prevClientes.map(cliente => 
          cliente._id === clienteSelecionado._id 
            ? { ...cliente, valorAtendimento: valorNumerico } 
            : cliente
        ));
        
        // Atualizar cliente selecionado
        setClienteSelecionado({
          ...clienteSelecionado,
          valorAtendimento: valorNumerico
        });
        
      } catch (error) {
        console.error('Erro ao atualizar valor do atendimento:', error);
        alert('Erro ao salvar o valor do atendimento. Por favor, tente novamente.');
      } finally {
        setEnviandoDados(false);
      }
    };
    
    // Determinar o tipo predominante e recomendações
    const tipoPredominante = clienteSelecionado.questionario?.resultado?.tipoPredominante || '';
    const interpretacao = interpretarTipoPredominante(tipoPredominante);
    const recomendacoes = gerarRecomendacoes(tipoPredominante);
    
    return (
      <div className="modal-backdrop">
        <div className="modal-extra-large">
          <div className="modal-header">
            <h3>Detalhes do Cliente</h3>
            <button 
              onClick={() => setClienteSelecionado(null)}
              className="modal-close-btn"
            >
              ✕
            </button>
          </div>
          
          <div className="modal-content">
            <div className="cliente-info-grid">
              <div className="info-column">
                <div className="card-section">
                  <h4>Informações Pessoais</h4>
                  <div className="info-dados">
                    <p><strong>Nome:</strong> {clienteSelecionado.nome}</p>
                    <p><strong>Email:</strong> {clienteSelecionado.email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {clienteSelecionado.telefone || 'Não informado'}</p>
                    <p><strong>Data de Nascimento:</strong> {clienteSelecionado.dataNascimento ? formatarData(clienteSelecionado.dataNascimento) : 'Não informada'}</p>
                    <p><strong>Gênero:</strong> {clienteSelecionado.genero || 'Não informado'}</p>
                    <p><strong>Profissão:</strong> {clienteSelecionado.profissao || 'Não informada'}</p>
                  </div>
                </div>
                
                <div className="card-section">
                  <h4>Status do Questionário</h4>
                  <div className="status-badge-container">
                    <span className={`status-badge ${clienteSelecionado.questionarioConcluido ? 'status-success' : 'status-warning'}`}>
                      {clienteSelecionado.questionarioConcluido ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>
                </div>
                
                <div className="card-section">
                  <h4>Observações do Gerente</h4>
                  <div className="observacoes-box">
                    {clienteSelecionado.observacoesAptidao ? (
                      <p>{clienteSelecionado.observacoesAptidao}</p>
                    ) : (
                      <p style={{ color: '#999' }}>Nenhuma observação do gerente disponível.</p>
                    )}
                  </div>
                </div>
                
                <div className="card-section">
                  <h4>Recomendações para Intervenção</h4>
                  <div className="recomendacoes-box">
                    <ul className="recomendacoes-lista">
                      {recomendacoes.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="info-column">
                <div className="card-section">
                  <h4>Valor do Atendimento</h4>
                  <div className="valor-container">
                    <div className="input-group">
                      <label>R$</label>
                      <input
                        type="number"
                        value={valorAtendimento}
                        onChange={(e) => atualizarValorAtendimento(e.target.value)}
                        placeholder="150"
                        disabled={enviandoDados}
                        className="valor-input"
                      />
                    </div>
                    <p className="valor-info">Este valor será usado para todos os próximos atendimentos deste cliente.</p>
                  </div>
                </div>
                
                <div className="card-section">
                  <h4>Progresso de Atendimentos</h4>
                  <div className="atendimentos-progress">
                    <p className="progresso-info">Clique nos círculos para adicionar ou remover atendimentos</p>
                    <div className="progress-circles">
                      {Array(21).fill(0).map((_, index) => (
                        <div 
                          key={index}
                          className={`progress-circle ${(clienteSelecionado.atendimentos || []).length > index ? 'completed' : ''}`}
                          onClick={() => toggleAtendimento(index)}
                        >
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    <p className="progresso-total">
                      <strong>Total de atendimentos:</strong> {(clienteSelecionado.atendimentos || []).length} de 21
                    </p>
                  </div>
                </div>
                
                <div className="card-section">
                  <h4>Anotações do Atendimento</h4>
                  <textarea 
                    className="observacoes-input"
                    placeholder="Adicione suas anotações sobre o atendimento aqui..."
                    value={observacoesAtendimento}
                    onChange={(e) => setObservacoesAtendimento(e.target.value)}
                    disabled={enviandoDados}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button
              onClick={() => setClienteSelecionado(null)}
              className="btn-secondary"
            >
              Fechar
            </button>
            
            {clienteSelecionado.questionarioConcluido && (
              <button
                onClick={() => {
                  setClienteDevolutiva(clienteSelecionado);
                  setAbaAtiva('devolutiva');
                  setClienteSelecionado(null);
                }}
                className="btn-primary"
              >
                Ver Devolutiva
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Componente para adcionar bloco de notas
  const registrarAtendimento = async (clienteId, observacoes) => {
    try {
      setLoading(true);
      
      // No futuro, você pode implementar este endpoint
      // Por enquanto, simulamos a adição no frontend
      const clienteAtualizado = { ...clienteSelecionado };
      
      if (!clienteAtualizado.atendimentos) {
        clienteAtualizado.atendimentos = [];
      }
      
      clienteAtualizado.atendimentos.push({
        data: new Date(),
        profissional: user.id,
        observacoes: observacoes || 'Atendimento registrado'
      });
      
      // Atualize o cliente selecionado e a lista
      setClienteSelecionado(clienteAtualizado);
      
      // Atualize a lista de clientes com o cliente modificado
      setClientes(clientes.map(c => 
        c._id === clienteId ? clienteAtualizado : c
      ));
      
      setLoading(false);
      alert('Atendimento registrado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error);
      setLoading(false);
      alert('Erro ao registrar atendimento. Por favor, tente novamente.');
    }
  };

  // Componente de abas de navegação
  const NavTabs = () => {
    return (
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${abaAtiva === 'meusClientes' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('meusClientes')}
        >
          Meus Clientes
        </button>
        <button 
          className={`nav-tab ${abaAtiva === 'devolutiva' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('devolutiva')}
          disabled={!clienteDevolutiva}
        >
          Devolutiva
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  const renderMeusClientes = () => {
    return (
      <>
        <div className="card">
          <h1 className="card-title">
            Dashboard do Profissional
          </h1>
          <p>
            Bem-vindo(a), {user?.nome}! Você tem acesso a {clientes.length} clientes.
          </p>
          
          {/* Estatísticas básicas */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total de Clientes</h3>
              <p className="stat-value">{clientes.length}</p>
            </div>
            
            <div className="stat-card">
              <h3>Clientes Ativos</h3>
              <p className="stat-value">
                {clientes.filter(c => c.status === 'atribuido').length}
              </p>
            </div>
            
            <div className="stat-card">
              <h3>Atendimentos</h3>
              <p className="stat-value">
                {clientes.reduce((total, cliente) => 
                  total + (cliente.atendimentos?.length || 0), 0
                )}
              </p>
            </div>
            
            <div className="stat-card">
              <h3>Próximos Agendamentos</h3>
              <p className="stat-value">
                {clientes.filter(c => {
                  const proximoAtendimento = c.proximoAtendimento;
                  if (!proximoAtendimento) return false;
                  const dataAgendamento = new Date(proximoAtendimento);
                  const hoje = new Date();
                  return dataAgendamento >= hoje;
                }).length}
              </p>
            </div>
          </div>
          
          {/* Gráfico de distribuição de tipos */}
          <div className="chart-container">
            <h3 className="chart-title">Distribuição de Tipos</h3>
            <div className="tipo-chart">
              {/* Aqui iria um componente de gráfico - simulação visual: */}
              <div className="pie-chart-container">
                <div className="pie-chart-legend">
                  <div className="legend-item">
                    <span className="color-box color-no"></span>
                    <span className="legend-text">NO: {tipoDistribuicao.NO || 0}</span>
                  </div>
                  <div className="legend-item">
                    <span className="color-box color-so"></span>
                    <span className="legend-text">SO: {tipoDistribuicao.SO || 0}</span>
                  </div>
                  <div className="legend-item">
                    <span className="color-box color-ne"></span>
                    <span className="legend-text">NE: {tipoDistribuicao.NE || 0}</span>
                  </div>
                  <div className="legend-item">
                    <span className="color-box color-se"></span>
                    <span className="legend-text">SE: {tipoDistribuicao.SE || 0}</span>
                  </div>
                </div>
                <div className="pie-chart-visual">
                  {/* Aqui seria renderizado o gráfico real */}
                  <div className="pie-placeholder">Distribuição de Tipos Predominantes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Campo de busca */}
        <div className="search-container">
          <div className="search-wrapper">
            <i className="search-icon">🔍</i>
            <input
              type="text"
              placeholder="Buscar cliente por nome, email ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input"
            />
            {busca && (
              <button 
                onClick={() => setBusca('')}
                className="search-clear-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Lista de clientes */}
        <div className="card">
          <h2 className="card-title">Meus Clientes</h2>
          
          {clientesFiltrados.length === 0 ? (
            <div className="empty-message">
              <p>{clientes.length === 0 ? 'Você não possui clientes atribuídos no momento.' : 'Nenhum cliente encontrado para a busca atual.'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Contato</th>
                    <th>Data Cadastro</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map((cliente) => (
                    <tr key={cliente._id}>
                      <td>{cliente.nome}</td>
                      <td>
                        <div>{cliente.email || "N/A"}</div>
                        <div>{cliente.telefone || "N/A"}</div>
                      </td>
                      <td>{formatarData(cliente.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${cliente.questionarioConcluido ? 'status-success' : 'status-warning'}`}>
                          {cliente.questionarioConcluido 
                            ? 'Concluído' 
                            : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => setClienteSelecionado(cliente)}
                          className="btn-link"
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  // Renderizar aba de Devolutiva
  const renderDevolutiva = () => {
    if (!clienteDevolutiva) {
      return (
        <div className="card">
          <div className="empty-message">
            <p>Selecione um cliente para ver a devolutiva.</p>
          </div>
        </div>
      );
    }
    
    const tipoPredominante = determinarTipoPredominante(clienteDevolutiva);
    const interpretacao = interpretarTipoPredominante(tipoPredominante);
    const recomendacoes = gerarRecomendacoes(tipoPredominante);
    
    return (
      <>
        <div className="card">
          <h1 className="card-title">Devolutiva do Cliente</h1>
          
          <div className="cliente-selector">
            <label htmlFor="cliente-select">Cliente: </label>
            <select 
              id="cliente-select"
              value={clienteDevolutiva._id}
              onChange={(e) => {
                const clienteId = e.target.value;
                const cliente = clientes.find(c => c._id === clienteId);
                if (cliente) {
                  setClienteDevolutiva(cliente);
                }
              }}
            >
              {clientes.filter(c => c.questionarioConcluido).map(cliente => (
                <option key={cliente._id} value={cliente._id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="cliente-info">
            <div className="info-group">
              <p><strong>Nome:</strong> {clienteDevolutiva.nome}</p>
              <p><strong>Email:</strong> {clienteDevolutiva.email || "Não informado"}</p>
              <p><strong>Telefone:</strong> {clienteDevolutiva.telefone || "Não informado"}</p>
            </div>
            <div className="info-group">
              <p><strong>Data de Nascimento:</strong> {formatarData(clienteDevolutiva.dataNascimento)}</p>
              <p><strong>Gênero:</strong> {clienteDevolutiva.genero}</p>
              <p><strong>Data de Cadastro:</strong> {formatarData(clienteDevolutiva.createdAt)}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-title">Resultados da Avaliação</h2>
          
          <div className="resultado-container">
            <div className="tipo-predominante">
              <h3>Tipo Predominante: {tipoPredominante}</h3>
              <p className="interpretacao">{interpretacao}</p>
            </div>
            
            <div className="scores-container">
              <div className="score-item score-no">
                <h4>NO</h4>
                <div className="score-value">
                  {clienteDevolutiva.questionario?.resultado?.NO || 0}
                </div>
                <div className="score-label">Racional/Técnico</div>
              </div>
              <div className="score-item score-so">
                <h4>SO</h4>
                <div className="score-value">
                  {clienteDevolutiva.questionario?.resultado?.SO || 0}
                </div>
                <div className="score-label">Organizador/Detalhista</div>
              </div>
              <div className="score-item score-ne">
                <h4>NE</h4>
                <div className="score-value">
                  {clienteDevolutiva.questionario?.resultado?.NE || 0}
                </div>
                <div className="score-label">Criativo/Inovador</div>
              </div>
              <div className="score-item score-se">
                <h4>SE</h4>
                <div className="score-value">
                  {clienteDevolutiva.questionario?.resultado?.SE || 0}
                </div>
                <div className="score-label">Social/Emocional</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-title">Recomendações para Intervenção</h2>
          <div className="recomendacoes-container">
            <ul className="recomendacoes-lista">
              {recomendacoes.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
            
            <div className="devolutiva-actions">
              <button className="btn-primary btn-export">
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="app-content">
      {/* Barra de navegação por abas */}
      <NavTabs />
      
      {/* Conteúdo com base na aba selecionada */}
      {abaAtiva === 'meusClientes' ? renderMeusClientes() : renderDevolutiva()}
      
      {/* Modal de detalhes */}
      {clienteSelecionado && <ModalDetalhesCliente />}
    </div>
  );
};

export default DashboardProfissional;