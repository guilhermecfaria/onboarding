import React from 'react';

const BrainVisualizationModal = ({ cliente }) => {
  // Verificar se temos resultados disponíveis
  const hasData = cliente?.questionario?.resultado && 
    (cliente.questionario.resultado.NO > 0 || 
     cliente.questionario.resultado.SO > 0 || 
     cliente.questionario.resultado.NE > 0 || 
     cliente.questionario.resultado.SE > 0);
  
  const resultado = cliente?.questionario?.resultado || { NO: 0, SO: 0, NE: 0, SE: 0 };

  // Estado de carregamento ou erro
  if (!cliente?.questionario) {
    return (
      <div className="card card-inner">
        <h4>Visualização Cerebral</h4>
        <div style={{ padding: '15px', textAlign: 'center' }}>
          <p>Carregando dados do questionário...</p>
        </div>
      </div>
    );
  }

  // Se não há dados positivos, mostrar mensagem
  if (!hasData) {
    return (
      <div className="card card-inner">
        <h4>Visualização Cerebral</h4>
        <div style={{ padding: '15px', textAlign: 'center' }}>
          <p>Não há dados suficientes para gerar a visualização cerebral.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-inner">
      <h4>Visualização Cerebral</h4>
      <div className="cerebro-mini" style={{ 
        position: 'relative', 
        width: '200px', 
        height: '200px', 
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        borderRadius: '50%',
        overflow: 'hidden'
      }}>
        {/* Linha vertical */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', backgroundColor: '#333' }}></div>
        
        {/* Linha horizontal */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: '#333' }}></div>
        
        {/* Quadrante NO - Superior Esquerdo */}
        <div style={{ 
          position: 'absolute', 
          top: '5%', 
          left: '5%', 
          width: '40%', 
          height: '40%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(60, 90, 190, 0.2)',
          borderRadius: '50% 0 0 0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>NO</h3>
            <p style={{ margin: '2px 0', fontSize: '14px' }}>{resultado.NO || 0}</p>
          </div>
        </div>
        
        {/* Quadrante NE - Superior Direito */}
        <div style={{ 
          position: 'absolute', 
          top: '5%', 
          right: '5%', 
          width: '40%', 
          height: '40%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(240, 180, 60, 0.2)',
          borderRadius: '0 50% 0 0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>NE</h3>
            <p style={{ margin: '2px 0', fontSize: '14px' }}>{resultado.NE || 0}</p>
          </div>
        </div>
        
        {/* Quadrante SO - Inferior Esquerdo */}
        <div style={{ 
          position: 'absolute', 
          bottom: '5%', 
          left: '5%', 
          width: '40%', 
          height: '40%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(60, 160, 120, 0.2)',
          borderRadius: '0 0 0 50%'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>SO</h3>
            <p style={{ margin: '2px 0', fontSize: '14px' }}>{resultado.SO || 0}</p>
          </div>
        </div>
        
        {/* Quadrante SE - Inferior Direito */}
        <div style={{ 
          position: 'absolute', 
          bottom: '5%', 
          right: '5%', 
          width: '40%', 
          height: '40%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(220, 80, 80, 0.2)',
          borderRadius: '0 0 50% 0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>SE</h3>
            <p style={{ margin: '2px 0', fontSize: '14px' }}>{resultado.SE || 0}</p>
          </div>
        </div>
      </div>

      <div className="totais-mini" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginTop: '15px',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        <div style={{ padding: '6px', backgroundColor: 'rgba(150, 135, 125, 0.1)', borderRadius: '4px' }}>
          <strong>NO+NE:</strong> {(resultado.NO || 0) + (resultado.NE || 0)}
        </div>
        <div style={{ padding: '6px', backgroundColor: 'rgba(150, 135, 125, 0.1)', borderRadius: '4px' }}>
          <strong>SO+SE:</strong> {(resultado.SO || 0) + (resultado.SE || 0)}
        </div>
        <div style={{ padding: '6px', backgroundColor: 'rgba(150, 135, 125, 0.1)', borderRadius: '4px' }}>
          <strong>NE+SE:</strong> {(resultado.NE || 0) + (resultado.SE || 0)}
        </div>
        <div style={{ padding: '6px', backgroundColor: 'rgba(150, 135, 125, 0.1)', borderRadius: '4px' }}>
          <strong>SO+NO:</strong> {(resultado.SO || 0) + (resultado.NO || 0)}
        </div>
      </div>
    </div>
  );
};

export default BrainVisualizationModal;