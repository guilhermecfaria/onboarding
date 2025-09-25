import React from 'react';

const ClienteItem = ({ cliente, onDragStart, onDragEnd }) => {
  // Função para formatar a data
  const formatarData = (data) => {
    if (!data) return "Não agendado";
    const dataObj = new Date(data);
    // Verificar se é uma data válida
    if (isNaN(dataObj.getTime())) return "Data inválida";
    
    return dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Formatar telefone para exibição, se disponível
  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Sem telefone';
    
    // Remover caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    // Aplicar formatação de acordo com o tamanho
    if (numeros.length === 11) {
      // Celular: (99) 99999-9999
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    } else if (numeros.length === 10) {
      // Fixo: (99) 9999-9999
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    }
    
    return telefone; // Retorna o original se não puder ser formatado
  };

  // Calcular a idade a partir da data de nascimento, se disponível
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    // Ajustar idade se ainda não fez aniversário no ano atual
    if (mesNascimento > mesAtual || 
        (mesNascimento === mesAtual && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return `${idade} anos`;
  };
  
  // Determinar se há um próximo atendimento agendado
  const temProximoAtendimento = cliente.proximoAtendimento;
  const proximaData = temProximoAtendimento 
    ? new Date(cliente.proximoAtendimento).toLocaleDateString('pt-BR')
    : null;
  
  return (
    <div 
      className="cliente-item"
      draggable="true"
      onDragStart={(e) => onDragStart(e, cliente)}
      onDragEnd={onDragEnd}
      data-id={cliente._id}
    >
      <div className="cliente-info">
        <div className="cliente-nome">
          {cliente.nome}
          {cliente.idade && <span className="cliente-idade">{calcularIdade(cliente.dataNascimento)}</span>}
        </div>
        
        <div className="cliente-detalhes">
          <div className="cliente-contato">
            {formatarTelefone(cliente.telefone)} 
            {cliente.email && <span>• {cliente.email}</span>}
          </div>
          
          {temProximoAtendimento && (
            <div className="cliente-proximo-atendimento">
              Próximo atendimento: {formatarData(cliente.proximoAtendimento)}
            </div>
          )}
        </div>
      </div>
      
      <div className="cliente-arraste">
        <span className="arraste-icone">☰</span>
        <span className="arraste-texto">Arraste para agendar</span>
      </div>
    </div>
  );
};

export default ClienteItem; 