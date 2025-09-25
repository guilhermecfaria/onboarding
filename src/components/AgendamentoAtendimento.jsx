// src/components/AgendamentoAtendimento.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Componente para agendar próximo atendimento
const AgendamentoAtendimento = ({ clienteId, onAgendamentoSalvo, proximoAtendimento }) => {
  const { user } = useAuth();
  const [dataAgendamento, setDataAgendamento] = useState(
    proximoAtendimento ? new Date(proximoAtendimento).toISOString().split('T')[0] : ''
  );
  const [salvando, setSalvando] = useState(false);
  
  const handleAgendarAtendimento = async () => {
    if (!dataAgendamento) {
      alert('Por favor, selecione uma data para o próximo atendimento.');
      return;
    }
    
    try {
      setSalvando(true);
      
      const response = await axios.put(`http://localhost:5000/api/clientes/${clienteId}/proximo-atendimento`, {
        data: dataAgendamento
      });
      
      if (response.data.success) {
        alert('Próximo atendimento agendado com sucesso!');
        
        // Notificar o componente pai
        if (onAgendamentoSalvo) {
          onAgendamentoSalvo(response.data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao agendar atendimento:', error);
      alert('Erro ao agendar atendimento. Por favor, tente novamente.');
    } finally {
      setSalvando(false);
    }
  };
  
  return (
    <div className="card card-inner">
      <h4>Agendar Próximo Atendimento</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 0' }}>
        <input
          type="date"
          value={dataAgendamento}
          onChange={(e) => setDataAgendamento(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            flex: 1
          }}
          disabled={salvando}
          min={new Date().toISOString().split('T')[0]} // Data mínima é hoje
        />
        <button
          onClick={handleAgendarAtendimento}
          disabled={salvando || !dataAgendamento}
          style={{
            padding: '8px 12px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: salvando || !dataAgendamento ? 'not-allowed' : 'pointer'
          }}
        >
          {salvando ? "Salvando..." : "Agendar"}
        </button>
      </div>
      {proximoAtendimento && (
        <p style={{ fontSize: '14px', color: '#333', marginTop: '10px' }}>
          <strong>Atendimento agendado para:</strong> {new Date(proximoAtendimento).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
};

export default AgendamentoAtendimento;