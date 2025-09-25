# import React, { useState, useEffect } from 'react';
# import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

# const DashboardProfissional = ({ profissionalInfo }) => {
#   // Estado para armazenar os dados dos clientes
#   const [clientes, setClientes] = useState([]);
#   const [clienteSelecionado, setClienteSelecionado] = useState(null);
#   const [estatisticasGerais, setEstatisticasGerais] = useState({ A: 0, B: 0, C: 0, D: 0 });
#   const [loading, setLoading] = useState(true);
#   const [periodoFiltro, setPeriodoFiltro] = useState('todos');
#   const [abaAtiva, setAbaAtiva] = useState('meusClientes');
#   const [todosProfissionais, setTodosProfissionais] = useState([]);
  
#   // Verifica se o usuário é gerente
#   const ehGerente = profissionalInfo?.tipo === 'gerente';
  
#   // Simulando dados de clientes - em um ambiente real, esses dados viriam da API
#   useEffect(() => {
#     // Simular chamada de API
#     setLoading(true);
    
#     setTimeout(() => {
#       // Dados simulados de profissionais
#       const profissionais = [
#         { id: 2, nome: 'Dr. João Silva', email: 'joao@exemplo.com', especialidade: 'Psicologia', totalClientes: 3, status: 'Ativo' },
#         { id: 3, nome: 'Dra. Maria Santos', email: 'maria@exemplo.com', especialidade: 'Coaching', totalClientes: 2, status: 'Ativo' },
#         { id: 4, nome: 'Dr. Carlos Oliveira', email: 'carlos@exemplo.com', especialidade: 'Psiquiatria', totalClientes: 3, status: 'Ativo' }
#       ];
#       setTodosProfissionais(profissionais);
      
#       // Dados simulados de clientes por profissional
#       const todosClientes = {
#         1: [ // Clientes do gerente (Ricardo)
#           {
#             id: 401,
#             nome: "Amanda Ribeiro",
#             idade: 36,
#             genero: "feminino",
#             telefone: "(11) 97777-5555",
#             dataCriacao: "2025-01-10T10:30:00Z",
#             contagem: { A: 3, B: 4, C: 3, D: 2 }
#           },
#           {
#             id: 402,
#             nome: "Bruno Alves",
#             idade: 42,
#             genero: "masculino",
#             telefone: "(11) 96666-4444",
#             dataCriacao: "2025-02-12T14:45:00Z",
#             contagem: { A: 5, B: 2, C: 2, D: 3 }
#           }
#         ],
#         2: [ // Clientes do profissional 1 (João)
#           {
#             id: 101,
#             nome: "Pedro Mendes",
#             idade: 35,
#             genero: "masculino",
#             telefone: "(11) 99999-1234",
#             dataCriacao: "2025-01-20T14:30:00Z",
#             contagem: { A: 5, B: 3, C: 2, D: 2 }
#           },
#           {
#             id: 102,
#             nome: "Lúcia Ferreira",
#             idade: 29,
#             genero: "feminino",
#             telefone: "(11) 98888-5678",
#             dataCriacao: "2025-02-05T09:15:00Z",
#             contagem: { A: 2, B: 6, C: 3, D: 1 }
#           },
#           {
#             id: 103,
#             nome: "Roberto Almeida",
#             idade: 42,
#             genero: "masculino",
#             telefone: "(11) 97777-9012",
#             dataCriacao: "2025-02-15T16:45:00Z",
#             contagem: { A: 3, B: 4, C: 4, D: 1 }
#           }
#         ],
#         3: [ // Clientes do profissional 2 (Maria)
#           {
#             id: 201,
#             nome: "Juliana Costa",
#             idade: 31,
#             genero: "feminino",
#             telefone: "(11) 96666-3456",
#             dataCriacao: "2025-01-25T11:20:00Z",
#             contagem: { A: 6, B: 2, C: 1, D: 3 }
#           },
#           {
#             id: 202,
#             nome: "Felipe Santos",
#             idade: 27,
#             genero: "masculino",
#             telefone: "(11) 95555-7890",
#             dataCriacao: "2025-02-10T13:40:00Z",
#             contagem: { A: 4, B: 4, C: 2, D: 2 }
#           }
#         ],
#         4: [ // Clientes do profissional 3 (Carlos)
#           {
#             id: 301,
#             nome: "Mariana Lima",
#             idade: 38,
#             genero: "feminino",
#             telefone: "(11) 94444-2345",
#             dataCriacao: "2025-01-15T10:10:00Z",
#             contagem: { A: 1, B: 3, C: 7, D: 1 }
#           },
#           {
#             id: 302,
#             nome: "Ricardo Oliveira",
#             idade: 45,
#             genero: "masculino",
#             telefone: "(11) 93333-6789",
#             dataCriacao: "2025-02-01T15:30:00Z",
#             contagem: { A: 2, B: 1, C: 5, D: 4 }
#           },
#           {
#             id: 303,
#             nome: "Carla Ribeiro",
#             idade: 33,
#             genero: "feminino",
#             telefone: "(11) 92222-0123",
#             dataCriacao: "2025-02-18T09:00:00Z",
#             contagem: { A: 1, B: 2, C: 6, D: 3 }
#           }
#         ]
#       };
      
#       // Seleciona apenas os clientes do profissional logado
#       const clientesDoProfissional = profissionalInfo ? 
#         todosClientes[profissionalInfo.id] || [] : [];
      
#       // Filtra por período, se aplicável
#       let clientesFiltrados = clientesDoProfissional;
      
#       if (periodoFiltro !== 'todos') {
#         const hoje = new Date();
#         const diasAtras = {
#           '7dias': 7,
#           '30dias': 30,
#           '90dias': 90
#         }[periodoFiltro];
        
#         const dataLimite = new Date();
#         dataLimite.setDate(hoje.getDate() - diasAtras);
        
#         clientesFiltrados = clientesDoProfissional.filter(cliente => {
#           const dataCriacao = new Date(cliente.dataCriacao);
#           return dataCriacao >= dataLimite;
#         });
#       }
      
#       setClientes(clientesFiltrados);
      
#       // Calcular estatísticas gerais
#       const total = { A: 0, B: 0, C: 0, D: 0 };
#       clientesFiltrados.forEach(cliente => {
#         total.A += cliente.contagem.A;
#         total.B += cliente.contagem.B;
#         total.C += cliente.contagem.C;
#         total.D += cliente.contagem.D;
#       });
      
#       setEstatisticasGerais(total);
#       setLoading(false);
#     }, 1000);
#   }, [profissionalInfo, periodoFiltro]);

#   // Formatar data
#   const formatarData = (dataString) => {
#     const data = new Date(dataString);
#     return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
#   };
  
#   // Preparar dados para o gráfico
#   const prepararDadosGrafico = (dados) => {
#     return [
#       { name: 'Tipo A', valor: dados.A, fill: '#8884d8' },
#       { name: 'Tipo B', valor: dados.B, fill: '#82ca9d' },
#       { name: 'Tipo C', valor: dados.C, fill: '#ffc658' },
#       { name: 'Tipo D', valor: dados.D, fill: '#ff8042' }
#     ];
#   };
  
#   // Preparar dados para o gráfico de pizza dos profissionais
#   const prepararDadosProfissionais = () => {
#     return todosProfissionais.map(p => ({
#       name: p.nome.split(' ')[1], // Apenas o sobrenome para o gráfico
#       value: p.totalClientes
#     }));
#   };
  
#   // Cores para o gráfico de pizza
#   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
#   // Determinar a categoria predominante
#   const determinarPredominante = (contagem) => {
#     const tipos = Object.keys(contagem);
#     let predominante = tipos[0];
    
#     tipos.forEach(tipo => {
#       if (contagem[tipo] > contagem[predominante]) {
#         predominante = tipo;
#       }
#     });
    
#     return predominante;
#   };
  
#   // Interpretar a predominância
#   const interpretarPredominancia = (tipo) => {
#     switch(tipo) {
#       case 'A':
#         return "Este perfil indica tendência a características analíticas, metodológicas e estruturadas.";
#       case 'B':
#         return "Este perfil indica tendência a características criativas, inovadoras e conceituais.";
#       case 'C':
#         return "Este perfil indica tendência a características sociais, empáticas e colaborativas.";
#       case 'D':
#         return "Este perfil indica tendência a características práticas, objetivas e orientadas a resultados.";
#       default:
#         return "Perfil misto com características equilibradas.";
#     }
#   };
  
#   // Simular download de Excel
#   const exportarExcel = () => {
#     alert('Exportando dados para Excel...');
#     // Em uma implementação real, isso faria uma chamada à API para gerar o arquivo Excel
#   };
  
#   // Simular download de PDF para um cliente específico
#   const exportarPDF = (clienteId) => {
#     alert(`Gerando PDF para o cliente #${clienteId}...`);
#     // Em uma implementação real, isso faria uma chamada à API para gerar o PDF
#   };
  
#   // Mudança no período de filtro
#   const handlePeriodoChange = (e) => {
#     setPeriodoFiltro(e.target.value);
#   };
  
#   // Mudança na aba ativa
#   const handleAbaChange = (aba) => {
#     setAbaAtiva(aba);
#   };
  
#   // Modal para visualizar detalhes do cliente
#   const ModalDetalhesCliente = () => {
#     if (!clienteSelecionado) return null;
    
#     const tipoPredominante = determinarPredominante(clienteSelecionado.contagem);
#     const interpretacao = interpretarPredominancia(tipoPredominante);
    
#     return (
#       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
#         <div className="bg-white rounded-lg p-6 max-w-lg w-full">
#           <div className="flex justify-between items-center mb-4">
#             <h3 className="text-xl font-semibold">Detalhes do Cliente</h3>
#             <button 
#               onClick={() => setClienteSelecionado(null)}
#               className="text-gray-500 hover:text-gray-700"
#             >
#               ✕
#             </button>
#           </div>
          
#           <div className="mb-4">
#             <p><strong>Nome:</strong> {clienteSelecionado.nome}</p>
#             <p><strong>Idade:</strong> {clienteSelecionado.idade}</p>
#             <p><strong>Gênero:</strong> {clienteSelecionado.genero}</p>
#             <p><strong>Telefone:</strong> {clienteSelecionado.telefone}</p>
#             <p><strong>Data:</strong> {formatarData(clienteSelecionado.dataCriacao)}</p>
#           </div>
          
#           <div className="mb-4">
#             <h4 className="font-medium mb-2">Resultados:</h4>
#             <div className="grid grid-cols-4 gap-2">
#               <div className="bg-purple-100 p-2 rounded text-center">
#                 <div className="font-bold text-purple-800">{clienteSelecionado.contagem.A}</div>
#                 <div className="text-xs text-gray-600">Tipo A</div>
#               </div>
#               <div className="bg-green-100 p-2 rounded text-center">
#                 <div className="font-bold text-green-800">{clienteSelecionado.contagem.B}</div>
#                 <div className="text-xs text-gray-600">Tipo B</div>
#               </div>
#               <div className="bg-yellow-100 p-2 rounded text-center">
#                 <div className="font-bold text-yellow-800">{clienteSelecionado.contagem.C}</div>
#                 <div className="text-xs text-gray-600">Tipo C</div>
#               </div>
#               <div className="bg-orange-100 p-2 rounded text-center">
#                 <div className="font-bold text-orange-800">{clienteSelecionado.contagem.D}</div>
#                 <div className="text-xs text-gray-600">Tipo D</div>
#               </div>
#             </div>
#           </div>
          
#           <div className="p-3 bg-gray-50 rounded mb-4 border-l-4 border-blue-500">
#             <h4 className="font-medium mb-1">Interpretação:</h4>
#             <p className="text-sm">{interpretacao}</p>
#             <p className="text-sm mt-2">
#               <strong>Tipo predominante:</strong> {tipoPredominante} 
#               ({Math.round((clienteSelecionado.contagem[tipoPredominante] / 12) * 100)}%)
#             </p>
#           </div>
          
#           <div className="h-44 mb-4">
#             <ResponsiveContainer width="100%" height="100%">
#               <BarChart data={prepararDadosGrafico(clienteSelecionado.contagem)}>
#                 <CartesianGrid strokeDasharray="3 3" />
#                 <XAxis dataKey="name" />
#                 <YAxis />
#                 <Tooltip />
#                 <Bar dataKey="valor" name="Quantidade" />
#               </BarChart>
#             </ResponsiveContainer>
#           </div>
          
#           <div className="flex justify-end">
#             <button
#               onClick={() => exportarPDF(clienteSelecionado.id)}
#               className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
#             >
#               Exportar PDF
#             </button>
#           </div>
#         </div>
#       </div>
#     );
#   };
#     // Se não houver informações do profissional, exibir uma mensagem
#   if (!profissionalInfo) {
#     return (
#       <div style={{
#         padding: '2rem',
#         textAlign: 'center',
#         maxWidth: '600px',
#         margin: '0 auto'
#       }}>
#         <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e74c3c' }}>
#           Acesso não autorizado
#         </h2>
#         <p>
#           Você precisa estar logado como profissional para acessar o dashboard.
#           Por favor, faça login para continuar.
#         </p>
#       </div>
#     );
#   }
  
#   // Componente de loading
#   if (loading) {
#     return (
#       <div style={{
#         display: 'flex',
#         justifyContent: 'center',
#         alignItems: 'center',
#         height: '300px',
#         flexDirection: 'column'
#       }}>
#         <div style={{
#           width: '40px',
#           height: '40px',
#           border: '4px solid #f3f3f3',
#           borderTop: '4px solid #3498db',
#           borderRadius: '50%',
#           animation: 'spin 1s linear infinite',
#           marginBottom: '1rem'
#         }}></div>
#         <p>Carregando dados...</p>
        
#         <style jsx>{`
#           @keyframes spin {
#             0% { transform: rotate(0deg); }
#             100% { transform: rotate(360deg); }
#           }
#         `}</style>
#       </div>
#     );
#   }
  
#   // Barras de navegação e abas para o gerente
#   const NavBarGerente = (
#     <div style={{
#       display: 'flex',
#       marginBottom: '1rem',
#       borderBottom: '1px solid #ddd'
#     }}>
#       <button
#         onClick={() => handleAbaChange('meusClientes')}
#         style={{
#           padding: '0.75rem 1.5rem',
#           backgroundColor: abaAtiva === 'meusClientes' ? '#3498db' : 'transparent',
#           color: abaAtiva === 'meusClientes' ? 'white' : '#2c3e50',
#           border: 'none',
#           borderRadius: '4px 4px 0 0',
#           fontWeight: '500',
#           cursor: 'pointer'
#         }}
#       >
#         Meus Clientes
#       </button>
#       <button
#         onClick={() => handleAbaChange('todosProfissionais')}
#         style={{
#           padding: '0.75rem 1.5rem',
#           backgroundColor: abaAtiva === 'todosProfissionais' ? '#3498db' : 'transparent',
#           color: abaAtiva === 'todosProfissionais' ? 'white' : '#2c3e50',
#           border: 'none',
#           borderRadius: '4px 4px 0 0',
#           fontWeight: '500',
#           cursor: 'pointer'
#         }}
#       >
#         Todos os Profissionais
#       </button>
#     </div>
#   );
  
#   // Renderiza o dashboard dos profissionais quando o gerente está na aba de todos os profissionais
#   if (ehGerente && abaAtiva === 'todosProfissionais') {
#     return (
#       <div className="min-h-screen bg-gray-100">
#         {NavBarGerente}
        
#         <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
#           {/* Dashboard de gerenciamento de profissionais */}
#           <div className="bg-white shadow rounded-lg p-6 mb-6">
#             <h2 className="text-xl font-semibold mb-4">Visão Geral dos Profissionais</h2>
            
#             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
#               <div style={{ flex: '1', minWidth: '300px' }}>
#                 <div style={{ height: '300px' }}>
#                   <ResponsiveContainer width="100%" height="100%">
#                     <PieChart>
#                       <Pie
#                         data={prepararDadosProfissionais()}
#                         cx="50%"
#                         cy="50%"
#                         labelLine={true}
#                         label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
#                         outerRadius={80}
#                         fill="#8884d8"
#                         dataKey="value"
#                       >
#                         {prepararDadosProfissionais().map((entry, index) => (
#                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
#                         ))}
#                       </Pie>
#                       <Tooltip formatter={(value) => [`${value} clientes`, 'Total']} />
#                       <Legend />
#                     </PieChart>
#                   </ResponsiveContainer>
#                 </div>
#                 <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#7f8c8d' }}>
#                   Distribuição de clientes por profissional
#                 </p>
#               </div>
              
#               <div style={{ flex: '1', minWidth: '300px' }}>
#                 <div style={{
#                   backgroundColor: '#f8f9fa',
#                   padding: '1.5rem',
#                   borderRadius: '8px',
#                   height: '100%'
#                 }}>
#                   <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2c3e50' }}>
#                     Estatísticas Gerais
#                   </h3>
#                   <div style={{ marginBottom: '1rem' }}>
#                     <p><strong>Total de profissionais ativos:</strong> {todosProfissionais.length}</p>
#                     <p><strong>Total de clientes:</strong> {todosProfissionais.reduce((sum, p) => sum + p.totalClientes, 0)}</p>
#                     <p><strong>Média de clientes por profissional:</strong> {(todosProfissionais.reduce((sum, p) => sum + p.totalClientes, 0) / todosProfissionais.length).toFixed(1)}</p>
#                   </div>
#                   <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
#                     Última atualização: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}
#                   </p>
#                 </div>
#               </div>
#             </div>
            
#             <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2c3e50' }}>
#               Lista de Profissionais
#             </h3>
            
#             <div className="overflow-x-auto">
#               <table className="min-w-full bg-white">
#                 <thead>
#                   <tr>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Nome
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Email
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Especialidade
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Total de Clientes
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Status
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Ações
#                     </th>
#                   </tr>
#                 </thead>
#                 <tbody>
#                   {todosProfissionais.map((profissional) => (
#                     <tr key={profissional.id} className="hover:bg-gray-50">
#                       <td className="py-4 px-4 border-b border-gray-200">
#                         <div className="font-medium text-gray-900">{profissional.nome}</div>
#                       </td>
#                       <td className="py-4 px-4 border-b border-gray-200">
#                         {profissional.email}
#                       </td>
#                       <td className="py-4 px-4 border-b border-gray-200">
#                         {profissional.especialidade}
#                       </td>
#                       <td className="py-4 px-4 border-b border-gray-200">
#                         {profissional.totalClientes}
#                       </td>
#                       <td className="py-4 px-4 border-b border-gray-200">
#                         <span style={{
#                           padding: '0.25rem 0.5rem',
#                           borderRadius: '9999px',
#                           fontSize: '0.75rem',
#                           fontWeight: '600',
#                           backgroundColor: profissional.status === 'Ativo' ? '#e8f8f5' : '#fff3e0',
#                           color: profissional.status === 'Ativo' ? '#2ecc71' : '#f39c12'
#                         }}>
#                           {profissional.status}
#                         </span>
#                       </td>
#                       <td className="py-4 px-4 border-b border-gray-200">
#                         <button 
#                           style={{
#                             background: 'none',
#                             border: 'none',
#                             color: '#3498db',
#                             cursor: 'pointer',
#                             marginRight: '0.5rem'
#                           }}
#                           onClick={() => alert(`Editando o profissional: ${profissional.nome}`)}
#                         >
#                           Editar
#                         </button>
#                         |
#                         <button 
#                           style={{
#                             background: 'none',
#                             border: 'none',
#                             color: '#e74c3c',
#                             cursor: 'pointer',
#                             marginLeft: '0.5rem'
#                           }}
#                           onClick={() => alert(`Você está prestes a desativar o profissional: ${profissional.nome}`)}
#                         >
#                           Desativar
#                         </button>
#                       </td>
#                     </tr>
#                   ))}
#                 </tbody>
#               </table>
#             </div>
            
#             <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
#               <button
#                 style={{
#                   padding: '0.75rem 1.5rem',
#                   backgroundColor: '#3498db',
#                   color: 'white',
#                   border: 'none',
#                   borderRadius: '4px',
#                   cursor: 'pointer'
#                 }}
#                 onClick={() => alert('Novo profissional seria adicionado aqui')}
#               >
#                 Adicionar Profissional
#               </button>
              
#               <button
#                 style={{
#                   padding: '0.75rem 1.5rem',
#                   backgroundColor: '#2ecc71',
#                   color: 'white',
#                   border: 'none',
#                   borderRadius: '4px',
#                   cursor: 'pointer'
#                 }}
#                 onClick={exportarExcel}
#               >
#                 Exportar Relatório
#               </button>
#             </div>
#           </div>
#         </main>
#       </div>
#     );
#   };
#   // Dashboard dos clientes (visível para todos os profissionais e gerentes na aba "Meus Clientes")
#   return (
#     <div className="min-h-screen bg-gray-100">
#       {/* Mostrar as abas apenas se for gerente */}
#       {ehGerente && NavBarGerente}
      
#       <div style={{
#         backgroundColor: '#f7f9fa',
#         padding: '1rem',
#         borderRadius: '8px',
#         marginBottom: '1.5rem',
#         display: 'flex',
#         justifyContent: 'space-between',
#         alignItems: 'center',
#         flexWrap: 'wrap',
#         gap: '1rem'
#       }}>
#         <div>
#           <h2 style={{ fontSize: '1.4rem', color: '#2c3e50', marginBottom: '0.25rem' }}>
#             Bem-vindo(a), {profissionalInfo.nome}
#           </h2>
#           <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
#             Especialidade: {profissionalInfo.especialidade} | Email: {profissionalInfo.email}
#           </p>
#         </div>
        
#         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
#           <label htmlFor="periodo" style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
#             Período:
#           </label>
#           <select
#             id="periodo"
#             value={periodoFiltro}
#             onChange={handlePeriodoChange}
#             style={{
#               padding: '0.5rem',
#               borderRadius: '4px',
#               border: '1px solid #ddd',
#               backgroundColor: 'white'
#             }}
#           >
#             <option value="todos">Todos os períodos</option>
#             <option value="7dias">Últimos 7 dias</option>
#             <option value="30dias">Últimos 30 dias</option>
#             <option value="90dias">Últimos 90 dias</option>
#           </select>
#         </div>
#       </div>
      
#       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
#         {/* Estatísticas gerais */}
#         <div className="bg-white shadow rounded-lg p-6 mb-6">
#           <h2 className="text-xl font-semibold mb-4">Estatísticas Gerais ({clientes.length} clientes)</h2>
          
#           {clientes.length === 0 ? (
#             <div style={{
#               padding: '3rem 1rem',
#               textAlign: 'center',
#               backgroundColor: '#f8f9fa',
#               borderRadius: '8px'
#             }}>
#               <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
#                 Não há dados disponíveis para o período selecionado
#               </p>
#               <button
#                 onClick={() => setPeriodoFiltro('todos')}
#                 style={{
#                   marginTop: '1rem',
#                   padding: '0.6rem 1rem',
#                   backgroundColor: '#3498db',
#                   color: 'white',
#                   border: 'none',
#                   borderRadius: '4px',
#                   cursor: 'pointer'
#                 }}
#               >
#                 Ver todos os períodos
#               </button>
#             </div>
#           ) : (
#             <div className="mb-6">
#               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
#                 <div className="bg-purple-100 p-4 rounded-lg text-center">
#                   <div className="text-2xl font-bold text-purple-800">{estatisticasGerais.A}</div>
#                   <div className="text-sm text-gray-600">Tipo A</div>
#                 </div>
#                 <div className="bg-green-100 p-4 rounded-lg text-center">
#                   <div className="text-2xl font-bold text-green-800">{estatisticasGerais.B}</div>
#                   <div className="text-sm text-gray-600">Tipo B</div>
#                 </div>
#                 <div className="bg-yellow-100 p-4 rounded-lg text-center">
#                   <div className="text-2xl font-bold text-yellow-800">{estatisticasGerais.C}</div>
#                   <div className="text-sm text-gray-600">Tipo C</div>
#                 </div>
#                 <div className="bg-orange-100 p-4 rounded-lg text-center">
#                   <div className="text-2xl font-bold text-orange-800">{estatisticasGerais.D}</div>
#                   <div className="text-sm text-gray-600">Tipo D</div>
#                 </div>
#               </div>
              
#               <div className="h-64">
#                 <ResponsiveContainer width="100%" height="100%">
#                   <BarChart data={prepararDadosGrafico(estatisticasGerais)}>
#                     <CartesianGrid strokeDasharray="3 3" />
#                     <XAxis dataKey="name" />
#                     <YAxis />
#                     <Tooltip />
#                     <Legend />
#                     <Bar dataKey="valor" name="Quantidade" />
#                   </BarChart>
#                 </ResponsiveContainer>
#               </div>
              
#               <div className="p-4 bg-blue-50 rounded-lg mt-4 border-l-4 border-blue-500">
#                 <h3 className="font-medium text-blue-800 mb-2">Interpretação dos Tipos:</h3>
#                 <ul className="text-sm space-y-2">
#                   <li><strong className="text-purple-700">Tipo A:</strong> Características analíticas, metodológicas e estruturadas</li>
#                   <li><strong className="text-green-700">Tipo B:</strong> Características criativas, inovadoras e conceituais</li>
#                   <li><strong className="text-yellow-700">Tipo C:</strong> Características sociais, empáticas e colaborativas</li>
#                   <li><strong className="text-orange-700">Tipo D:</strong> Características práticas, objetivas e orientadas a resultados</li>
#                 </ul>
#               </div>
#             </div>
#           )}
          
#           <div className="flex justify-end">
#             <button 
#               onClick={exportarExcel}
#               className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
#               disabled={clientes.length === 0}
#               style={{ opacity: clientes.length === 0 ? 0.5 : 1 }}
#             >
#               Exportar para Excel
#             </button>
#           </div>
#         </div>
        
#         {/* Lista de clientes */}
#         <div className="bg-white shadow rounded-lg p-6 mb-6">
#           <div className="flex justify-between items-center mb-4">
#             <h2 className="text-xl font-semibold">Clientes ({clientes.length})</h2>
            
#             <div className="relative">
#               <input
#                 type="text"
#                 placeholder="Buscar cliente..."
#                 style={{
#                   padding: '0.5rem 0.75rem',
#                   borderRadius: '4px',
#                   border: '1px solid #ddd',
#                   width: '250px'
#                 }}
#               />
#             </div>
#           </div>
          
#           {clientes.length === 0 ? (
#             <div style={{
#               padding: '3rem 1rem',
#               textAlign: 'center',
#               backgroundColor: '#f8f9fa',
#               borderRadius: '8px'
#             }}>
#               <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
#                 Não há clientes disponíveis para o período selecionado
#               </p>
#             </div>
#           ) : (
#             <div className="overflow-x-auto">
#               <table className="min-w-full bg-white">
#                 <thead>
#                   <tr>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Nome
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Idade
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Gênero
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Telefone
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Data
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       A
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       B
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       C
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       D
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Predominante
#                     </th>
#                     <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
#                       Ações
#                     </th>
#                   </tr>
#                 </thead>
#                 <tbody>
#                   {clientes.map(cliente => {
#                     const tipoPredominante = determinarPredominante(cliente.contagem);
#                     return (
#                       <tr key={cliente.id} className="hover:bg-gray-50">
#                         <td className="py-4 px-4 border-b border-gray-200">
#                           <div className="font-medium text-gray-900">{cliente.nome}</div>
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200">
#                           {cliente.idade}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200 capitalize">
#                           {cliente.genero}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200">
#                           {cliente.telefone}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200">
#                           {formatarData(cliente.dataCriacao)}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200 font-medium text-purple-700">
#                           {cliente.contagem.A}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200 font-medium text-green-700">
#                           {cliente.contagem.B}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200 font-medium text-yellow-700">
#                           {cliente.contagem.C}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200 font-medium text-orange-700">
#                           {cliente.contagem.D}
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200">
#                           <span className={`font-bold px-2 py-1 rounded text-xs ${
#                             tipoPredominante === 'A' ? 'bg-purple-100 text-purple-800' :
#                             tipoPredominante === 'B' ? 'bg-green-100 text-green-800' :
#                             tipoPredominante === 'C' ? 'bg-yellow-100 text-yellow-800' :
#                             'bg-orange-100 text-orange-800'
#                           }`}>
#                             Tipo {tipoPredominante}
#                           </span>
#                         </td>
#                         <td className="py-4 px-4 border-b border-gray-200">
#                           <button 
#                             onClick={() => setClienteSelecionado(cliente)}
#                             className="text-blue-600 hover:text-blue-800 mr-2"
#                           >
#                             Ver
#                           </button>
#                           <button 
#                             onClick={() => exportarPDF(cliente.id)}
#                             className="text-red-600 hover:text-red-800"
#                           >
#                             PDF
#                           </button>
#                         </td>
#                       </tr>
#                     );
#                   })}
#                 </tbody>
#               </table>
#             </div>
#           )}
#         </div>
#       </main>
      
#       {/* Modal de detalhes do cliente */}
#       {clienteSelecionado && <ModalDetalhesCliente />}
#     </div>
#   );
# };

# export default DashboardProfissional;
