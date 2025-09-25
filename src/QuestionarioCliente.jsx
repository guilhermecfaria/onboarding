import React, { useState, useEffect } from 'react';
import axios from 'axios';


const QuestionarioCliente = ({ clienteId, onSubmit, resetQuestionario }) => {
  const [etapa, setEtapa] = useState(0); // Começamos na etapa 0 (introdução)
  const [dadosPessoais, setDadosPessoais] = useState({
    nome: '',
    dataNascimento: '',
    genero: '',
    endereco: '',
    telefone: '',
    profissao: '',
    email: '',
    cpf: '',
    quemIndicou: ''
  });

  const [estruturaQuestionario, setEstruturaQuestionario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para armazenar as respostas do usuário
  const [respostas, setRespostas] = useState([]);
  
  const [concluido, setConcluido] = useState(false);

  const [clienteIdLocal, setClienteIdLocal] = useState(clienteId || null);

  const [errosCampos, setErrosCampos] = useState({});

// Primeiro useEffect (novo, para logging)
useEffect(() => {
  console.log("Estado atual:", {
    etapa,
    estruturaQuestionario,
    respostas,
    isLoading,
    error
  });
}, [etapa, estruturaQuestionario, respostas, isLoading, error]);

// Useeffect de reset
useEffect(() => {
  // Se o componente pai sinalizar para resetar
  if (resetQuestionario) {
    const fetchEstruturaQuestionario = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/questionarios/estrutura');
        setEstruturaQuestionario(response.data.data);
        
        // Inicializar o estado de respostas com base nas categorias
        const respostasIniciais = response.data.data.categorias.map(categoria => ({
          categoria: categoria.numero,
          opcoesSelecionadas: []
        }));
        
        setRespostas(respostasIniciais);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar estrutura do questionário:', error);
        setError('Não foi possível carregar o questionário. Por favor, tente novamente mais tarde.');
        setIsLoading(false);
      }
    };

    fetchEstruturaQuestionario();

    // Resetar outros estados
    setEtapa(0);
    setDadosPessoais({
      nome: '',
      dataNascimento: '',
      genero: '',
      endereco: '',
      telefone: '',
      profissao: '',
      email: '',
      cpf: '',
      quemIndicou: ''
    });
    setConcluido(false);
    setClienteIdLocal(null);
    setError(null);
  }
}, [resetQuestionario]);

// Segundo useEffect (original, para buscar dados)
useEffect(() => {
  const fetchEstruturaQuestionario = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/questionarios/estrutura');
      setEstruturaQuestionario(response.data.data);
      
      // Inicializar o estado de respostas com base nas categorias
      const respostasIniciais = response.data.data.categorias.map(categoria => ({
        categoria: categoria.numero,
        opcoesSelecionadas: []
      }));
      
      setRespostas(respostasIniciais);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar estrutura do questionário:', error);
      setError('Não foi possível carregar o questionário. Por favor, tente novamente mais tarde.');
      setIsLoading(false);
    }
  };

  fetchEstruturaQuestionario();
}, []);
  
  const handleInputChange = (e) => {
    setDadosPessoais({
      ...dadosPessoais,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSelecaoToggle = (categoriaIndex, opcaoNumero) => {
    // Obter a categoria atual que está sendo respondida
    const categoriaAtual = estruturaQuestionario.categorias[categoriaIndex];
    const qtdEscolhas = categoriaAtual.qtdEscolhas || 4;
    
    // Atualizar as respostas para esta categoria
    const novasRespostas = [...respostas];
    const respostaAtual = novasRespostas[categoriaIndex];
    
    // Verificar se a opção já foi selecionada
    const opcaoSelecionadaIndex = respostaAtual.opcoesSelecionadas.indexOf(opcaoNumero);
    
    if (opcaoSelecionadaIndex > -1) {
      // Remover a opção se já estiver selecionada
      respostaAtual.opcoesSelecionadas.splice(opcaoSelecionadaIndex, 1);
    } else if (respostaAtual.opcoesSelecionadas.length < qtdEscolhas) {
      // Adicionar a opção se ainda não atingiu o limite
      respostaAtual.opcoesSelecionadas.push(opcaoNumero);
    }
    
    setRespostas(novasRespostas);
  };
  
  const handleGrupoSelecao = (categoriaIndex, grupoIndex, opcaoNumero) => {
    // Lógica para seleção em grupos (1 opção por grupo)
    const novasRespostas = [...respostas];
    const respostaAtual = novasRespostas[categoriaIndex];
    
    // Remover qualquer opção deste grupo que já esteja selecionada
    const opcoesMesmoGrupo = respostaAtual.opcoesSelecionadas.filter(op => 
      !op.startsWith(`grupo${grupoIndex + 1}-`));
    
    // Adicionar a nova opção selecionada com prefixo do grupo
    opcoesMesmoGrupo.push(`grupo${grupoIndex + 1}-${opcaoNumero}`);
    
    // Atualizar as opções selecionadas
    respostaAtual.opcoesSelecionadas = opcoesMesmoGrupo;
    
    setRespostas(novasRespostas);
  };
  
  const validarEtapaAtual = () => {
    if (etapa === 1) {
      // Validar dados pessoais
      const camposObrigatorios = ['nome', 'dataNascimento', 'genero'];
      const camposFaltando = camposObrigatorios.filter(campo => !dadosPessoais[campo]);
      
      if (camposFaltando.length > 0) {
        alert('Por favor, preencha todos os campos obrigatórios: ' + 
              camposFaltando.map(campo => campo.charAt(0).toUpperCase() + campo.slice(1)).join(', '));
        return false;
      }
      return true;
    } 
    else if (etapa >= 2 && etapa <= 9) {
      // Validar respostas do questionário
      const categoriaIndex = etapa - 2;
      if (categoriaIndex >= estruturaQuestionario.categorias.length) return true;
      
      const categoriaAtual = estruturaQuestionario.categorias[categoriaIndex];
      const respostaAtual = respostas[categoriaIndex];
      
      if (categoriaAtual.tipo === 'multipla') {
        // Para categorias de múltipla escolha, validar quantidade de seleções
        const qtdEscolhas = categoriaAtual.qtdEscolhas || 4;
        
        if (respostaAtual.opcoesSelecionadas.length !== qtdEscolhas) {
          alert(`Por favor, selecione exatamente ${qtdEscolhas} opções!`);
          return false;
        }
      } else if (categoriaAtual.tipo === 'grupo') {
        // Para categorias de grupo, verificar se há uma seleção por grupo
        const totalGrupos = categoriaAtual.grupos.length;
        const gruposSelecionados = new Set(
          respostaAtual.opcoesSelecionadas
            .filter(op => op.startsWith('grupo'))
            .map(op => op.split('-')[0])
        );
        
        if (gruposSelecionados.size !== totalGrupos) {
          alert('Por favor, selecione uma opção em cada grupo!');
          return false;
        }
      }
      
      return true;
    }
    
    return true;
  };
  
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Algoritmo de validação de CPF
    let soma = 0;
    let resto;
    
    if (cpf === "00000000000") return false;
    
    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  };
  
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  const avancarEtapa = () => {
    console.log('Avançar etapa chamado', etapa);
    console.log('Dados pessoais:', dadosPessoais);
  
    // Para a etapa inicial (introdução)
    if (etapa === 0) {
      console.log('Avançando da introdução');
      setEtapa(1);
      return;
    }
  
    // Validações para dados pessoais
    const novosErros = {};
  
    if (!dadosPessoais.nome.trim()) {
      console.log('Erro: Nome vazio');
      novosErros.nome = "Nome é obrigatório";
    }
  
    if (!dadosPessoais.dataNascimento) {
      console.log('Erro: Data de nascimento vazia');
      novosErros.dataNascimento = "Data de nascimento é obrigatória";
    }
  
    if (!dadosPessoais.genero) {
      console.log('Erro: Gênero não selecionado');
      novosErros.genero = "Gênero é obrigatório";
    }
  
      // Se o CPF estiver vazio, adicionar erro
    if (!dadosPessoais.cpf.trim()) {
      novosErros.cpf = "CPF é obrigatório";
    }
    // Se tiver valor, validar o formato
    else if (!validarCPF(dadosPessoais.cpf)) {
      novosErros.cpf = "CPF inválido";
    }
  
    if (dadosPessoais.email && !validarEmail(dadosPessoais.email)) {
      console.log('Erro: Email inválido');
      novosErros.email = "Email inválido";
    }
  
    // Se houver erros, não avançar
    if (Object.keys(novosErros).length > 0) {
      console.log('Erros encontrados:', novosErros);
      setErrosCampos(novosErros);
      return;
    }
  
    // Limpar erros se validação passar
    setErrosCampos({});
  
    // Continuar a lógica original de avanço de etapas
    if (etapa === 1) {
      console.log('Avançando para próxima etapa');
      setEtapa(2);
    }
    else if (etapa >= 2 && etapa <= 8) {
      // Avançar para a próxima categoria ou para a conclusão
      setEtapa(etapa + 1);
    }
    else if (etapa === 9) {
      // Último passo - submeter o questionário
      submeterQuestionario();
    }
  };
  
  const submeterQuestionario = async () => {
    try {
      setIsLoading(true);
      
      // Primeiro criar o cliente (ou usar o ID se já fornecido)
      let clientId;
      
      if (!clienteIdLocal) {
        console.log("Criando novo cliente...");
        // Criar um novo cliente
        const clienteResponse = await axios.post('/api/clientes/registro', dadosPessoais);
        console.log("Resposta da criação do cliente:", clienteResponse.data);
        
        // Usar setClienteIdLocal com o ID retornado
        clientId = clienteResponse.data.data._id;
        console.log("ID do cliente criado:", clientId);
        setClienteIdLocal(clientId);
      } else {
        clientId = clienteIdLocal;
      }
      
      // Verificar se o ID do cliente é válido
      if (!clientId) {
        throw new Error("ID do cliente não obtido. Não é possível submeter o questionário.");
      }
      
      console.log("Enviando questionário para cliente ID:", clientId);
      
      // Formatar as respostas para o formato esperado pela API
      const respostasFormatadas = respostas.map(resposta => {
        // Remover prefixos de grupo se existirem
        const opcoesSelecionadas = resposta.opcoesSelecionadas.map(op => {
          if (op.includes('-')) {
            return op.split('-')[1];
          }
          return op;
        });
        
        return {
          categoria: resposta.categoria,
          opcoesSelecionadas
        };
      });
      
      // Usar clientId (variável local) ao invés de clienteIdLocal (state que pode não estar atualizado)
      await axios.post(`/api/clientes/${clientId}/questionario`, {
        respostas: respostasFormatadas
      });
      
      setIsLoading(false);
      setConcluido(true);
      
      // Chamar o callback onSubmit se fornecido
      if (onSubmit) {
        onSubmit(clientId);
      }
      
    } catch (error) {
      console.error('Erro ao submeter questionário:', error);
      setError('Ocorreu um erro ao submeter suas respostas. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };
  
  const voltarEtapa = () => {
    setEtapa(Math.max(0, etapa - 1));
  };
  
  // Renderização condicional baseada na etapa atual
  const renderizarEtapa = () => {
    if (isLoading && etapa > 1) {
      return (
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4rem'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
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
        <div className="error-container" style={{
          backgroundColor: '#ffebee',
          padding: '2rem',
          borderRadius: '8px',
          color: '#c62828',
          textAlign: 'center'
        }}>
          <h3>Ops! Algo deu errado.</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            marginTop: '1rem',
            cursor: 'pointer'
          }}>
            Tentar novamente
          </button>
        </div>
      );
    }
    
    switch(etapa) {
      case 0:
        return (
          <div className="card" style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2.5rem'
          }}>
            <h2 className="card-title" style={{
              fontSize: '1.8rem',
              color: '#2c3e50',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Bem-vindo ao Questionário de Avaliação
            </h2>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              lineHeight: '1.7'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                color: '#3498db',
                marginBottom: '1rem'
              }}>
                Caro(a) participante,
              </h3>
              
              <p style={{ marginBottom: '1rem' }}>
                Você está prestes a iniciar um questionário de avaliação que nos ajudará a compreender 
                melhor seu perfil e necessidades específicas. Este processo foi cuidadosamente 
                desenvolvido para fornecer insights valiosos sobre suas características e preferências.
              </p>
              
              <p style={{ marginBottom: '1rem' }}>
                <strong>Não existem respostas certas ou erradas.</strong> A eficácia deste questionário 
                depende da sua honestidade ao responder cada pergunta. Os resultados serão analisados 
                dentro de um contexto holístico, considerando diversos fatores além das respostas individuais.
              </p>
              
              <div style={{
                backgroundColor: '#ebf5fb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #3498db'
              }}>
                <h4 style={{ 
                  fontSize: '1.1rem', 
                  marginBottom: '0.5rem',
                  color: '#2980b9'
                }}>
                  Instruções importantes:
                </h4>
                <ul style={{ 
                  paddingLeft: '1.5rem',
                  marginBottom: '0',
                  color: '#34495e'
                }}>
                  <li>Responda com base em como você realmente é, não como gostaria de ser</li>
                  <li>Considere seu comportamento típico no dia a dia</li>
                  <li>Não demore muito em cada resposta - suas primeiras impressões geralmente são as mais precisas</li>
                  <li>O questionário leva aproximadamente 10-15 minutos para ser concluído</li>
                  <li>Seus dados serão tratados com total confidencialidade</li>
                </ul>
              </div>
              
              <p>
                Após a conclusão do questionário, um de nossos profissionais analisará suas respostas 
                e entrará em contato para discutir os resultados e próximos passos. Este é apenas o 
                início de um processo que visa proporcionar a você uma experiência personalizada.
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#f2faf5',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              borderLeft: '4px solid #2ecc71'
            }}>
              <p style={{
                margin: '0',
                fontSize: '1.1rem',
                color: '#27ae60',
                fontWeight: '500'
              }}>
                "O autoconhecimento é o primeiro passo para o desenvolvimento pessoal. 
                Responder com sinceridade é um presente que você dá a si mesmo."
              </p>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={avancarEtapa} 
                style={{ 
                  padding: '0.85rem 2.5rem',
                  fontSize: '1.05rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                Iniciar Questionário
              </button>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="card">
            <h2 className="card-title">Seus Dados</h2>
            <div className="card-content">
              <div className="form-group">
                <label>Nome completo *</label>
                <input 
                  type="text" 
                  name="nome" 
                  autoComplete="off"
                  value={dadosPessoais.nome} 
                  onChange={(e) => {
                    // Aceitar apenas letras, espaços e caracteres especiais de nomes
                    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*$/;
                    if (regex.test(e.target.value) || e.target.value === '') {
                      handleInputChange(e);
                    }
                  }}
                  placeholder="Digite seu nome completo"
                  required
                  className={errosCampos.nome ? 'input-erro' : ''}
                  />
                  {errosCampos.nome && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>
                      {errosCampos.nome}
                    </span>                 
                  )}
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                  <label>Data de Nascimento *</label>
                  <input 
                    type="date" 
                    name="dataNascimento" 
                    autoComplete="off"
                    value={dadosPessoais.dataNascimento} 
                    onChange={handleInputChange}
                    required
                    className={errosCampos.dataNascimento ? 'input-erro' : ''}
                  />
                  {errosCampos.dataNascimento && (
                  <span style={{ color: 'red', fontSize: '0.8rem' }}>
                    {errosCampos.dataNascimento}
                  </span>
                )}
                </div>
                <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                  <label>Gênero *</label>
                  <select 
                    name="genero" 
                    value={dadosPessoais.genero} 
                    autoComplete="off"
                    onChange={handleInputChange}
                    required
                    className={errosCampos.genero ? 'input-erro' : ''}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                  {errosCampos.genero && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>
                      {errosCampos.genero}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Endereço</label>
                <input 
                  type="text" 
                  name="endereco" 
                  autoComplete="off"
                  value={dadosPessoais.endereco} 
                  onChange={handleInputChange}
                  placeholder="Digite seu endereço completo"
                />
              </div>
              
              <div className="form-group">
                <label>Profissão</label>
                <input 
                  type="text" 
                  name="profissao" 
                  autoComplete="off"
                  value={dadosPessoais.profissao} 
                  onChange={handleInputChange}
                  placeholder="Sua profissão atual"
                />
              </div>

              <div className="form-group">
                <label>CPF *</label>
                <input 
                  type="text" 
                  name="cpf" 
                  autoComplete="off"
                  value={dadosPessoais.cpf} 
                  onChange={(e) => {
                    // Aceitar apenas números e limitar a 11 caracteres
                    const regex = /^[0-9]*$/;
                    if ((regex.test(e.target.value) || e.target.value === '') && 
                        e.target.value.length <= 11) {
                      handleInputChange(e);
                    }
                  }}
                  placeholder="Apenas números"
                  maxLength={11}
                  required
                  className={errosCampos.cpf ? 'input-erro' : ''}
                />
                {errosCampos.cpf && (
                  <span style={{ color: 'red', fontSize: '0.8rem' }}>
                    {errosCampos.cpf}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Alguém te Indicou?</label>
                <input 
                  type="text" 
                  name="quemIndicou" 
                  autoComplete="off"
                  value={dadosPessoais.quemIndicou} 
                  onChange={handleInputChange}
                  placeholder="Deixe-nos saber se alguém o indicou! Deixe em branco se não recebeu indicação"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                  <label>Telefone</label>
                  <input 
                    type="tel" 
                    name="telefone" 
                    autoComplete="off"
                    value={dadosPessoais.telefone} 
                    onChange={(e) => {
                      // Aceitar apenas números e limitar a 15 caracteres
                      const regex = /^[0-9]*$/;
                      if ((regex.test(e.target.value) || e.target.value === '') && 
                          e.target.value.length <= 15) {
                        handleInputChange(e);
                      }
                    }}
                    placeholder="(XX) XXXXX-XXXX"
                    maxLength={15}
                  />
                 
                </div>
                <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    autoComplete="off"
                    value={dadosPessoais.email} 
                    onChange={handleInputChange}
                    placeholder="seuMelhor@email.com"
                  />
                </div>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '1rem' }}>
                * Campos obrigatórios
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                onClick={avancarEtapa} 
                style={{ 
                  padding: '0.85rem 2rem',
                  fontSize: '1.05rem'
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        );
      
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        // Verificar se temos a estrutura do questionário
        if (!estruturaQuestionario) return null;
        
        // Calcular qual categoria estamos mostrando (etapa 2 mostra categoria 0)
        const categoriaIndex = etapa - 2;
        
        // Verificar se atingimos o fim das categorias
        if (categoriaIndex >= estruturaQuestionario.categorias.length) {
          return (
            <div className="card">
              <h2 className="card-title">Revisar e Enviar</h2>
              <div className="card-content">
                <p>Você completou todas as perguntas do questionário!</p>
                <p>Agora você pode revisar suas respostas e enviar quando estiver pronto.</p>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1.5rem'
              }}>
                <button onClick={voltarEtapa} style={{
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50'
                }}>
                  Voltar
                </button>
                <button onClick={submeterQuestionario} style={{
                  backgroundColor: '#3498db',
                  cursor: 'pointer'
                }}>
                  Enviar Questionário
                </button>
              </div>
            </div>
          );
        }
        
        const categoriaAtual = estruturaQuestionario.categorias[categoriaIndex];
        const respostaAtual = respostas[categoriaIndex];
        
        // Renderizar de acordo com o tipo de categoria
        if (categoriaAtual.tipo === 'multipla') {
          // Renderizar categoria de múltipla escolha
          return (
            <div className="card">
              <h2 className="card-title">{categoriaAtual.titulo}</h2>
              <div className="card-content">
                <p style={{marginBottom: '1.5rem', fontSize: '1.05rem'}}>
                  <strong>{categoriaAtual.descricao}</strong>
                  <span style={{display: 'block', fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem'}}>
                    Você selecionou {respostaAtual.opcoesSelecionadas.length} de {categoriaAtual.qtdEscolhas || 4} opções
                  </span>
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {categoriaAtual.opcoes.map((opcao) => {
                    const isSelected = respostaAtual.opcoesSelecionadas.includes(opcao.numero);
                    return (
                      <div 
                        key={opcao.numero}
                        style={{
                          border: isSelected ? '2px solid #3498db' : '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '1rem',
                          margin: '0.5rem 0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: isSelected ? '#ebf5fb' : 'white',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(52, 152, 219, 0.15)' : 'none'
                        }}
                        onClick={() => handleSelecaoToggle(categoriaIndex, opcao.numero)}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#3498db' : 'white',
                          border: isSelected ? 'none' : '2px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {isSelected && '✓'}
                        </div>
                        <div style={{fontWeight: '500'}}>{opcao.texto}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1.5rem'
              }}>
                <button 
                  onClick={voltarEtapa} 
                  style={{
                    backgroundColor: '#ecf0f1',
                    color: '#2c3e50'
                  }}
                >
                  Voltar
                </button>
                <button 
                  onClick={avancarEtapa}
                  style={{
                    backgroundColor: respostaAtual.opcoesSelecionadas.length === (categoriaAtual.qtdEscolhas || 4) ? '#3498db' : '#bdc3c7',
                    cursor: respostaAtual.opcoesSelecionadas.length === (categoriaAtual.qtdEscolhas || 4) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          );
        } else if (categoriaAtual.tipo === 'grupo') {
          // Renderizar categoria com grupos
          return (
            <div className="card">
              <h2 className="card-title">{categoriaAtual.titulo}</h2>
              <div className="card-content">
                <p style={{marginBottom: '1.5rem', fontSize: '1.05rem'}}>
                  <strong>{categoriaAtual.descricao}</strong>
                </p>
                
                {categoriaAtual.grupos.map((grupo, grupoIndex) => {
                  // Identificar se este grupo tem uma opção selecionada
                  const grupoPrefix = `grupo${grupoIndex + 1}-`;
                  const opcaoSelecionada = respostaAtual.opcoesSelecionadas.find(op => 
                    op.startsWith(grupoPrefix));
                  
                  const opcaoSelecionadaNumero = opcaoSelecionada ? 
                    opcaoSelecionada.split('-')[1] : null;
                    
                  return (
                    <div key={grupoIndex} style={{marginBottom: '2rem'}}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        color: '#2c3e50',
                        marginBottom: '1rem',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '0.5rem'
                      }}>
                        {grupo.titulo}
                      </h3>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1rem'
                      }}>
                        {grupo.opcoes.map((opcao) => {
                          const isSelected = opcaoSelecionadaNumero === opcao.numero;
                          return (
                            <div 
                              key={opcao.numero}
                              style={{
                                border: isSelected ? '2px solid #3498db' : '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '1rem',
                                margin: '0.5rem 0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: isSelected ? '#ebf5fb' : 'white',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 2px 8px rgba(52, 152, 219, 0.15)' : 'none'
                              }}
                              onClick={() => handleGrupoSelecao(categoriaIndex, grupoIndex, opcao.numero)}
                            >
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? '#3498db' : 'white',
                                border: isSelected ? 'none' : '2px solid #ddd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem',
                                color: 'white',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {isSelected && '✓'}
                              </div>
                              <div style={{fontWeight: '500'}}>{opcao.texto}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1.5rem'
              }}>
                <button 
                  onClick={voltarEtapa} 
                  style={{
                    backgroundColor: '#ecf0f1',
                    color: '#2c3e50'
                  }}
                >
                  Voltar
                </button>
                <button 
                  onClick={avancarEtapa}
                  style={{
                    backgroundColor: '#3498db',
                    cursor: 'pointer'
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          );
        }
        
        return null;
      
      default:
        return null;
    }
  };
  
  // Tela de conclusão
  if (concluido) {
    return (
      <div className="card" style={{
        textAlign: 'center', 
        maxWidth: '700px', 
        margin: '0 auto',
        padding: '3rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#2ecc71',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          color: 'white',
          fontSize: '2.5rem',
          boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
        }}>
          ✓
        </div>
        
        <h2 style={{
          fontSize: '2rem', 
          marginBottom: '1.5rem', 
          color: '#2c3e50',
          fontWeight: '600'
        }}>
          Parabéns, {dadosPessoais.nome}!
        </h2>
        
        <div style={{
          backgroundColor: '#e8f8f5',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            color: '#16a085'
          }}>
            Suas respostas foram enviadas com sucesso. 
            Agradecemos sua participação!
          </p>
          <p style={{color: '#2c3e50'}}>
            Você acaba de completar um importante processo de autoavaliação que nos ajudará
            a entender melhor seu perfil e necessidades específicas.
          </p>
        </div>
        
        <div style={{
          backgroundColor: '#f7f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          borderLeft: '4px solid #3498db'
        }}>
          <p style={{
            fontWeight: '500', 
            fontSize: '1.1rem', 
            color: '#2c3e50'
          }}>
            Um de nossos profissionais entrará em contato em breve para discutir os resultados.
          </p>
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.85rem 2.5rem',
            fontSize: '1.05rem',
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(52, 152, 219, 0.25)',
            transition: 'all 0.3s ease'
          }}
        >
          Voltar ao Início
        </button>
      </div>
    );
  }
  
  // Calcular progresso total
  const totalEtapas = estruturaQuestionario ? estruturaQuestionario.categorias.length + 2 : 10;
  const progresso = Math.min(100, (etapa / totalEtapas) * 100);
  
  return (
    <div>
      {etapa > 0 && (
        <div style={{maxWidth: '800px', margin: '0 auto 2rem'}}>
          <div style={{
            backgroundColor: '#eef2f7',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#3498db',
              width: `${progresso}%`,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#7f8c8d'
          }}>
            Etapa {etapa} de {totalEtapas - 1}
          </div>
        </div>
      )}
      
      {renderizarEtapa()}
    </div>
  );
};

export default QuestionarioCliente;