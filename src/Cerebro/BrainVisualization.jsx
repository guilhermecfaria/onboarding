import React from 'react';

const BrainVisualization = ({ clienteDevolutiva }) => {
  // Verificar se temos resultados disponíveis
  const hasData = clienteDevolutiva?.questionario?.resultado && 
    (clienteDevolutiva.questionario.resultado.NO > 0 || 
     clienteDevolutiva.questionario.resultado.SO > 0 || 
     clienteDevolutiva.questionario.resultado.NE > 0 || 
     clienteDevolutiva.questionario.resultado.SE > 0);
  
  const resultado = clienteDevolutiva?.questionario?.resultado || { NO: 0, SO: 0, NE: 0, SE: 0 };

  // Estado de carregamento ou erro
  if (!clienteDevolutiva?.questionario) {
    return (
      <div className="card">
        <h2 className="card-title">TESTE DE FUNÇÃO CEREBRAL</h2>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Carregando dados do questionário...</p>
        </div>
      </div>
    );
  }

  // Se não há dados positivos, mostrar mensagem
  if (!hasData) {
    return (
      <div className="card">
        <h2 className="card-title">TESTE DE FUNÇÃO CEREBRAL</h2>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Não há dados suficientes para gerar a visualização cerebral.</p>
          <p>O cliente pode não ter concluído o questionário ou ocorreu um erro nos dados.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2 className="card-title">TESTE DE FUNÇÃO CEREBRAL</h2>
        <div className="cerebro-container" style={{ marginBottom: '30px' }}>
          {/* Visualização do cérebro */}
          <div className="cerebro-visualization" style={{ 
            position: 'relative', 
            width: '400px', 
            height: '400px', 
            margin: '0 auto',
            backgroundColor: '#f5f5f5',
            borderRadius: '0',
            overflow: 'hidden'
          }}>
            {/* Linha vertical */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', backgroundColor: '#333' }}></div>
            
            {/* Linha horizontal */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '2px', backgroundColor: '#333' }}></div>
            
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
              borderRadius: '0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '24px' }}>NO</h3>
                <p style={{ margin: '5px 0', fontSize: '16px' }}>{resultado.NO || 0}</p>
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
              borderRadius: '0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '24px' }}>NE</h3>
                <p style={{ margin: '5px 0', fontSize: '16px' }}>{resultado.NE || 0}</p>
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
              borderRadius: '0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '24px' }}>SO</h3>
                <p style={{ margin: '5px 0', fontSize: '16px' }}>{resultado.SO || 0}</p>
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
              borderRadius: '0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '24px' }}>SE</h3>
                <p style={{ margin: '5px 0', fontSize: '16px' }}>{resultado.SE || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Características de cada quadrante */}
          <div className="cerebro-caracteristicas" style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: '40px'
          }}>
            {/* NO */}
            <div style={{ width: '45%', marginBottom: '20px' }}>
              <div style={{ 
                backgroundColor: 'rgba(60, 90, 190, 0.2)', 
                padding: '10px', 
                borderRadius: '8px'
              }}>
                <h4 style={{ marginTop: 0 }}>NO - Características</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Lógico</li>
                  <li>Concreto</li>
                  <li>Analítico</li>
                  <li>Técnico</li>
                </ul>
              </div>
            </div>
            
            {/* NE */}
            <div style={{ width: '45%', marginBottom: '20px' }}>
              <div style={{ 
                backgroundColor: 'rgba(240, 180, 60, 0.2)', 
                padding: '10px', 
                borderRadius: '8px'
              }}>
                <h4 style={{ marginTop: 0 }}>NE - Características</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Criativo</li>
                  <li>Abstrato</li>
                  <li>Artístico</li>
                  <li>Holístico</li>
                </ul>
              </div>
            </div>
            
            {/* SO */}
            <div style={{ width: '45%', position: 'relative' }}>
              <div style={{ 
                backgroundColor: 'rgba(60, 160, 120, 0.2)', 
                padding: '10px', 
                borderRadius: '8px'
              }}>
                <h4 style={{ marginTop: 0 }}>SO - Características</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Organizado</li>
                  <li>Precavido</li>
                  <li>Conservador</li>
                  <li>Esmerado</li>
                </ul>
              </div>
            </div>
            
            {/* SE */}
            <div style={{ width: '45%', position: 'relative' }}>
              <div style={{ 
                backgroundColor: 'rgba(220, 80, 80, 0.2)', 
                padding: '10px', 
                borderRadius: '8px'
              }}>
                <h4 style={{ marginTop: 0 }}>SE - Características</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Comunicativo</li>
                  <li>Romântico</li>
                  <li>Afetuoso</li>
                  <li>Extrovertido</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Esta é a parte que precisamos separar para a página 3 */}
      <div className="card sum-quadrants-card">
        {/* Somas dos quadrantes */}
        <div className="cerebro-somas" style={{
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {/* Soma NO + NE */}
          <div style={{ 
            backgroundColor: 'rgba(150, 135, 125, 0.2)', 
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>NO + NE (Intelectual)</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {(resultado.NO || 0) + (resultado.NE || 0)}
            </div>
          </div>
          
          {/* Soma NE + SE */}
          <div style={{ 
            backgroundColor: 'rgba(150, 135, 125, 0.2)', 
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>NE + SE (Criativo Interpessoal)</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {(resultado.NE || 0) + (resultado.SE || 0)}
            </div>
          </div>
          
          {/* Soma SO + SE */}
          <div style={{ 
            backgroundColor: 'rgba(150, 135, 125, 0.2)', 
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>SO + SE (Operacional)</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {(resultado.SO || 0) + (resultado.SE || 0)}
            </div>
          </div>
          
          {/* Soma SO + NO */}
          <div style={{ 
            backgroundColor: 'rgba(150, 135, 125, 0.2)', 
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>SO + NO (Técnico Operacional)</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {(resultado.SO || 0) + (resultado.NO || 0)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrainVisualization;