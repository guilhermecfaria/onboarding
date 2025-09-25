import React, { useState } from 'react';

const TipoDistributionChart = ({ tipoDistribuicao, clientes }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  
  // Agrupar clientes por tipo predominante
  const clientesPorTipo = {
    NO: clientes.filter(c => c.questionario?.resultado?.tipoPredominante === 'NO'),
    SO: clientes.filter(c => c.questionario?.resultado?.tipoPredominante === 'SO'),
    NE: clientes.filter(c => c.questionario?.resultado?.tipoPredominante === 'NE'),
    SE: clientes.filter(c => c.questionario?.resultado?.tipoPredominante === 'SE')
  };
  
  // Definir os tipos com suas cores e posições fixas - ORDEM SEMPRE FIXA
  const tiposData = [
    { id: 'NO', label: 'Racional/Técnico', value: tipoDistribuicao.NO || 0, color: '#8884d8', clientes: clientesPorTipo.NO },
    { id: 'SO', label: 'Organizador/Detalhista', value: tipoDistribuicao.SO || 0, color: '#82ca9d', clientes: clientesPorTipo.SO },
    { id: 'NE', label: 'Criativo/Inovador', value: tipoDistribuicao.NE || 0, color: '#ffc658', clientes: clientesPorTipo.NE },
    { id: 'SE', label: 'Social/Emocional', value: tipoDistribuicao.SE || 0, color: '#ff8042', clientes: clientesPorTipo.SE }
  ];
  
  // Calcular o total para porcentagens
  const total = tiposData.reduce((sum, tipo) => sum + tipo.value, 0);
  
  // Verificar se temos dados
  const hasData = total > 0;
  
  if (!hasData) {
    return (
      <div className="card">
        <h2 className="card-title">Distribuição de Tipos Predominantes</h2>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Ainda não há dados suficientes para exibir o gráfico.</p>
          <p>À medida que seus clientes concluírem o questionário, os dados serão exibidos aqui.</p>
        </div>
      </div>
    );
  }
  
  // Componente para exibir informações sobre o tipo ao passar o mouse
  const TypeInfoCard = ({ tipo }) => {
    if (!tipo) return null;
    
    return (
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'absolute',
        top: '0',
        right: '0',
        width: '250px',
        zIndex: 100
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: tipo.color, borderBottom: `2px solid ${tipo.color}`, paddingBottom: '5px' }}>
          {tipo.id}: {tipo.label}
        </h3>
        
        <p><strong>Total:</strong> {tipo.value} cliente(s) ({total > 0 ? ((tipo.value / total) * 100).toFixed(1) : 0}%)</p>
        
        {tipo.clientes.length > 0 ? (
          <>
            <p><strong>Clientes deste tipo:</strong></p>
            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
              {tipo.clientes.map(cliente => (
                <li key={cliente._id}>{cliente.nome}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Não há clientes com este tipo predominante.</p>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <h2 className="card-title">Distribuição de Tipos Predominantes</h2>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        padding: '30px 0',
        position: 'relative'
      }}>
        {/* Quadrantes fixos sem o círculo */}
        <div style={{ 
          position: 'relative', 
          width: '300px', 
          height: '300px', 
          borderRadius: '0',
          border: '2px solid #eee',
          backgroundColor: 'white',
          overflow: 'hidden'
        }}>
          {/* Linhas divisórias */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', backgroundColor: '#eee', zIndex: 2 }}></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '2px', backgroundColor: '#eee', zIndex: 2 }}></div>
          
          {/* NO - Quadrante superior esquerdo (sempre fixo) */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '50%',
              backgroundColor: hoveredSlice === 'NO' ? '#8884d8' : 'rgba(136, 132, 216, 0.5)',
              opacity: tiposData[0].value > 0 ? 1 : 0.3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
            onMouseEnter={() => setHoveredSlice('NO')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div style={{ 
              position: 'absolute', 
              left: '25%', 
              top: '25%', 
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              fontWeight: 'bold',
              color: hoveredSlice === 'NO' ? 'white' : '#333'
            }}>
              <div>NO</div>
              <div>{tiposData[0].value}</div>
            </div>
          </div>
          
          {/* NE - Quadrante superior direito */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '50%',
              backgroundColor: hoveredSlice === 'NE' ? '#ffc658' : 'rgba(255, 198, 88, 0.5)',
              opacity: tiposData[2].value > 0 ? 1 : 0.3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
            onMouseEnter={() => setHoveredSlice('NE')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div style={{ 
              position: 'absolute', 
              right: '25%', 
              top: '25%', 
              transform: 'translate(50%, -50%)',
              textAlign: 'center',
              fontWeight: 'bold',
              color: hoveredSlice === 'NE' ? 'white' : '#333'
            }}>
              <div>NE</div>
              <div>{tiposData[2].value}</div>
            </div>
          </div>
          
          {/* SO - Quadrante inferior esquerdo */}
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '50%',
              height: '50%',
              backgroundColor: hoveredSlice === 'SO' ? '#82ca9d' : 'rgba(130, 202, 157, 0.5)',
              opacity: tiposData[1].value > 0 ? 1 : 0.3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
            onMouseEnter={() => setHoveredSlice('SO')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div style={{ 
              position: 'absolute', 
              left: '25%', 
              bottom: '25%', 
              transform: 'translate(-50%, 50%)',
              textAlign: 'center',
              fontWeight: 'bold',
              color: hoveredSlice === 'SO' ? 'white' : '#333'
            }}>
              <div>SO</div>
              <div>{tiposData[1].value}</div>
            </div>
          </div>
          
          {/* SE - Quadrante inferior direito */}
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '50%',
              height: '50%',
              backgroundColor: hoveredSlice === 'SE' ? '#ff8042' : 'rgba(255, 128, 66, 0.5)',
              opacity: tiposData[3].value > 0 ? 1 : 0.3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
            onMouseEnter={() => setHoveredSlice('SE')}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div style={{ 
              position: 'absolute', 
              right: '25%', 
              bottom: '25%', 
              transform: 'translate(50%, 50%)',
              textAlign: 'center',
              fontWeight: 'bold',
              color: hoveredSlice === 'SE' ? 'white' : '#333'
            }}>
              <div>SE</div>
              <div>{tiposData[3].value}</div>
            </div>
          </div>
          
          {/* Retângulo central em vez de círculo */}
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            borderRadius: '0',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            zIndex: 20
          }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Total</span>
            <span style={{ fontSize: '30px', fontWeight: 'bold' }}>{total}</span>
            <span style={{ fontSize: '12px', color: '#555' }}>clientes</span>
          </div>
        </div>
        
        {/* Card de informações para o tipo atualmente sob o mouse */}
        {hoveredSlice && <TypeInfoCard tipo={tiposData.find(t => t.id === hoveredSlice)} />}
      </div>
      
      {/* Legenda fixa, sempre na mesma ordem */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
        {tiposData.map((tipo) => (
          <div 
            key={tipo.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 15px',
              borderRadius: '30px',
              border: `1px solid ${tipo.color}`,
              backgroundColor: hoveredSlice === tipo.id ? `${tipo.color}20` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setHoveredSlice(tipo.id)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: tipo.color, 
              marginRight: '8px', 
              borderRadius: '50%' 
            }}></div>
            <span style={{ fontWeight: hoveredSlice === tipo.id ? 'bold' : 'normal' }}>
              {tipo.id} - {tipo.label} ({tipo.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipoDistributionChart;