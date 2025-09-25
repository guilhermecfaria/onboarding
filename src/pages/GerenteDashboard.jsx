// src/pages/GerenteDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';
import BrainVisualizationModal from '../Cerebro/BrainVisualizationModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GerenteDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para dados
  const [questionarios, setQuestionarios] = useState([]);
  const [questionariosFiltrados, setQuestionariosFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroTempo, setFiltroTempo] = useState('todos'); // 'todos', '1semana', '1mes'
  
  // Estados para visualização
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState(null);
  const [showBrainModal, setShowBrainModal] = useState(false);
  
  // Estados para edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [questionarioEdicao, setQuestionarioEdicao] = useState(null);
  const [testeTiro, setTesteTiro] = useState({
    checkbox1: false,
    checkbox2: false,
    checkbox3: false,
    checkbox4: false
  });
  const [comentarioLivre, setComentarioLivre] = useState('');

  // Carregar questionários preenchidos
  const carregarQuestionarios = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os clientes - mesmo método que funcionava antes
      const response = await axios.get('/api/clientes?todos=true');
      console.log('Resposta da API de clientes:', response.data);
      
      if (response.data.success) {
        const clientesData = response.data.data || [];
        console.log(`Total de clientes encontrados: ${clientesData.length}`);
        
        // Filtrar apenas clientes que responderam questionário
        const clientesComQuestionario = clientesData.filter(
          cliente => cliente.questionarioConcluido === true
        );
        console.log(`Clientes com questionário: ${clientesComQuestionario.length}`);
        
        // Para cada cliente, buscar os dados do questionário
        const questionariosPromises = clientesComQuestionario.map(async (cliente) => {
          try {
            const questionarioResponse = await axios.get(`/api/clientes/${cliente._id}/questionario`);
            console.log(`Questionário carregado para ${cliente.nome}:`, questionarioResponse.data);
            
            return {
              cliente,
              questionario: questionarioResponse.data.data,
              dataPreenchimento: questionarioResponse.data.data.createdAt
            };
          } catch (error) {
            console.error(`Erro ao buscar questionário do cliente ${cliente._id}:`, error);
            return null;
          }
        });
        
        const questionariosComDetalhes = await Promise.all(questionariosPromises);
        const questionariosValidos = questionariosComDetalhes.filter(q => q !== null);
        
        console.log(`Questionários válidos carregados: ${questionariosValidos.length}`);
        setQuestionarios(questionariosValidos);
      }
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      setError('Erro ao carregar questionários: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar por tempo
  const filtrarPorTempo = (questionarios, filtro) => {
    if (filtro === 'todos') return questionarios;
    
    const agora = new Date();
    const dataLimite = new Date();
    
    if (filtro === '1semana') {
      dataLimite.setDate(agora.getDate() - 7);
    } else if (filtro === '1mes') {
      dataLimite.setMonth(agora.getMonth() - 1);
    }
    
    return questionarios.filter(item => {
      const dataPreenchimento = new Date(item.dataPreenchimento);
      return dataPreenchimento >= dataLimite;
    });
  };

  // Filtrar questionários
  useEffect(() => {
    let filtrados = questionarios;
    
    // Filtrar por busca
    if (busca) {
      filtrados = filtrados.filter(item =>
        item.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        item.cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
        item.cliente.cpf?.includes(busca)
      );
    }
    
    setQuestionariosFiltrados(filtrados);
  }, [busca, questionarios]);

  // Carregar dados ao montar componente
  useEffect(() => {
    carregarQuestionarios();
  }, []);

  // Função para visualizar questionário
  const visualizarQuestionario = (item) => {
    setQuestionarioSelecionado(item);
    setShowBrainModal(true);
  };

  // Função para editar questionário
  const editarQuestionario = (item) => {
    setQuestionarioEdicao(item);
    // Carregar dados existentes do teste de tiro
    setTesteTiro({
      checkbox1: item.questionario.testeTiro?.checkbox1 || false,
      checkbox2: item.questionario.testeTiro?.checkbox2 || false,
      checkbox3: item.questionario.testeTiro?.checkbox3 || false,
      checkbox4: item.questionario.testeTiro?.checkbox4 || false
    });
    // Carregar comentário existente
    setComentarioLivre(item.questionario.comentarioLivre || '');
    setShowEditModal(true);
  };

   // Função para salvar edição
   const salvarEdicao = async () => {
     try {
       console.log('Salvando edição:', {
         id: questionarioEdicao.questionario._id,
         testeTiro,
         comentarioLivre,
         url: `/api/questionarios/${questionarioEdicao.questionario._id}/editar`
       });
       
       const response = await axios.put(
         `/api/questionarios/${questionarioEdicao.questionario._id}/editar`,
         { testeTiro, comentarioLivre }
       );
      
      console.log('Resposta do servidor:', response.data);
      
       if (response.data.success) {
         // Atualizar a lista de questionários
         await carregarQuestionarios();
         setShowEditModal(false);
         
         // Atualizar o questionário editado no estado local
         const updatedQuestionarios = questionarios.map(q => {
           if (q.questionario._id === questionarioEdicao.questionario._id) {
             return {
               ...q,
               questionario: {
                 ...q.questionario,
                 testeTiro: testeTiro,
                 comentarioLivre: comentarioLivre
               }
             };
           }
           return q;
         });
         setQuestionarios(updatedQuestionarios);
         
         alert('Edição salva com sucesso!');
       }
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      alert(`Erro ao salvar edição: ${error.response?.data?.message || error.message}`);
    }
  };

   // Função para gerar relatório Dr.Jou
   const gerarRelatorioDrJou = (item) => {
     const { cliente, questionario } = item;
     const resultado = questionario.resultado;
     const testeTiro = questionario.testeTiro || {};
     const comentario = questionario.comentarioLivre || '';
     
     const generatePDF = async () => {
       // Criar elemento temporário para renderizar o conteúdo
       const tempDiv = document.createElement('div');
       tempDiv.style.position = 'absolute';
       tempDiv.style.left = '-9999px';
       tempDiv.style.width = '750px';
       tempDiv.style.backgroundColor = 'white';
       tempDiv.innerHTML = `
         <div style="padding: 30px; font-family: Arial, sans-serif; color: #333;">
           <!-- Header -->
           <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
             <h1 style="margin: 0; font-size: 24px; color: #333;">Relatório de Direcionamento</h1>
           </div>
           
           <!-- Info do Cliente -->
           <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #333;">
             <p style="margin: 5px 0; font-size: 14px;"><strong>Nome:</strong> ${cliente.nome}</p>
             <p style="margin: 5px 0; font-size: 14px;"><strong>Data:</strong> ${new Date(questionario.createdAt).toLocaleDateString('pt-BR')}</p>
             <p style="margin: 5px 0; font-size: 14px;"><strong>Comentário:</strong> ${comentario || 'Nenhum comentário'}</p>
           </div>
           
           <!-- Teste de Tiro -->
           <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #333;">
             <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">Teste de Tiro:</p>
             <div style="font-size: 16px; font-weight: bold; text-align: center; background: white; padding: 8px; border-radius: 5px; color: #333;">
               ${testeTiro.checkbox1 ? '✓ 1' : '✗ 1'} | 
               ${testeTiro.checkbox2 ? '✓ 2' : '✗ 2'} | 
               ${testeTiro.checkbox3 ? '✓ 3' : '✗ 3'} | 
               ${testeTiro.checkbox4 ? '✓ 4' : '✗ 4'}
          </div>
           </div>
          
           <!-- Mapeamento Cerebral -->
           <div style="text-align: center; margin: 40px 0;">
             <h3 style="margin-bottom: 25px; color: #333; font-size: 22px;">Mapeamento Cerebral</h3>
             <div style="width: 600px; height: 400px; position: relative; margin: 25px auto; background: #f5f5f5; border: 3px solid #ddd; border-radius: 12px; padding: 15px;">
               
               <!-- Caixa superior -->
               <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 280px; height: 38px; background: white; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 6px;">
                PES + PDS (INTELECTUAL) = ${(resultado.NO || 0) + (resultado.NE || 0)}
              </div>
              
              <!-- Laterais verticais -->
               <div style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 70px; height: 200px; background: rgba(255,255,255,0.9); border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border-radius: 6px; padding: 4px; z-index: 2;">
                 <div style="transform: rotate(-90deg); white-space: nowrap; line-height: 1.0; text-align: center;">
                PEI + PES (TÉCNICO OPERACIONAL) = ${(resultado.SO || 0) + (resultado.NO || 0)}
              </div>
               </div>
               <div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 70px; height: 200px; background: rgba(255,255,255,0.9); border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border-radius: 6px; padding: 4px; z-index: 2;">
                 <div style="transform: rotate(90deg); white-space: nowrap; line-height: 1.0; text-align: center;">
                PDI + PDS (CRIATIVO INTERPESSOAL) = ${(resultado.SE || 0) + (resultado.NE || 0)}
                 </div>
              </div>
              
              <!-- Labels das categorias -->
               <div style="position: absolute; top: 70px; left: 65px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">LÓGICO</div>
               <div style="position: absolute; top: 70px; right: 65px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">CRIATIVO</div>
               <div style="position: absolute; bottom: 70px; left: 45px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">ORGANIZADO</div>
               <div style="position: absolute; bottom: 70px; right: 35px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">COMUNICATIVO</div>
              
              <!-- Cérebro central -->
               <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 250px; height: 200px; background-image: url('/cerebro2.png'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>

              <!-- Boxes dos cantos -->
               <div style="position: absolute; top: 60px; left: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PES</div>
                <div>${resultado.NO || 0}</div>
              </div>
               <div style="position: absolute; top: 60px; right: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PDS</div>
                <div>${resultado.NE || 0}</div>
              </div>
               <div style="position: absolute; bottom: 60px; left: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PEI</div>
                <div>${resultado.SO || 0}</div>
              </div>
               <div style="position: absolute; bottom: 60px; right: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PDI</div>
                <div>${resultado.SE || 0}</div>
              </div>
              
               <!-- Caixa inferior -->
               <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 280px; height: 38px; background: white; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 6px;">
                PEI + PDI (OPERACIONAL) = ${(resultado.SO || 0) + (resultado.SE || 0)}
              </div>
            </div>
          </div>
        </div>
       `;

       document.body.appendChild(tempDiv);

       try {
         // Converter para canvas
         const canvas = await html2canvas(tempDiv, {
           scale: 2,
           useCORS: true,
           allowTaint: true,
           backgroundColor: '#ffffff'
         });

         // Criar PDF
         const pdf = new jsPDF('p', 'mm', 'a4');
         const imgData = canvas.toDataURL('image/png');
         
         const imgWidth = 210; // A4 width in mm
         const pageHeight = 295; // A4 height in mm
         const imgHeight = (canvas.height * imgWidth) / canvas.width;
         let heightLeft = imgHeight;

         let position = 0;

         // Adicionar primeira página
         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
         heightLeft -= pageHeight;

         // Adicionar páginas extras se necessário
         while (heightLeft >= 0) {
           position = heightLeft - imgHeight;
           pdf.addPage();
           pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
           heightLeft -= pageHeight;
         }

         // Salvar PDF
         pdf.save(`Relatorio_DrJou_${cliente.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);

       } catch (error) {
         console.error('Erro ao gerar PDF:', error);
         alert('Erro ao gerar PDF. Tente novamente.');
       } finally {
         // Remover elemento temporário
         document.body.removeChild(tempDiv);
       }
     };

     generatePDF();
   };

   // Função para gerar devolutiva cliente
   const gerarDevolutivaCliente = (item) => {
     console.log('Gerando devolutiva cliente para:', item);
     console.log('Cliente:', item.cliente);
     console.log('Questionario:', item.questionario);

     if (!item || !item.cliente || !item.questionario) {
       alert('Erro: Dados do item inválidos');
       return;
     }

     const { cliente, questionario } = item;
     const resultado = questionario.resultado;
     const testeTiro = questionario.testeTiro || {};
     const comentario = questionario.comentarioLivre || '';

     const generatePDF = async () => {
       // Criar elemento temporário para renderizar o conteúdo
       const tempDiv = document.createElement('div');
       tempDiv.style.position = 'absolute';
       tempDiv.style.left = '-9999px';
       tempDiv.style.width = '750px';
       tempDiv.style.backgroundColor = 'white';
       tempDiv.innerHTML = `
         <div style="padding: 20px; font-family: Arial, sans-serif; color: #333; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word;">
           <!-- Header -->
           <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
             <h1 style="margin: 0; font-size: 22px; color: #333;">Devolutiva do Cliente</h1>
             <p style="margin: 8px 0 0 0; font-size: 14px;">${cliente.nome} - ${new Date(questionario.createdAt).toLocaleDateString('pt-BR')}</p>
           </div>
          
           <p style="font-size: 13px; margin-bottom: 15px; text-align: justify; word-wrap: break-word; hyphens: auto;">
             Este é o resultado do teste aplicado para verificar como seu cérebro toma decisões. Abaixo, as pontuações.
           </p>
           
           <p style="font-size: 13px; margin-bottom: 20px; text-align: justify; word-wrap: break-word; hyphens: auto;">
             A tomada de decisão é resultado da interação da função do cérebro direito e esquerdo, o cérebro esquerdo tem as decisões mais racionais e lógicas enquanto o direito é criativo e comunicativo, a região pré-frontal do cérebro é o local da decisão, que tem interferência em nossa função fisiológica e emocional.
           </p>

           <!-- Mapeamento Cerebral -->
           <div style="text-align: center; margin: 40px 0;">
             <h3 style="margin-bottom: 25px; color: #333; font-size: 22px;">Mapeamento Cerebral</h3>
             <div style="width: 600px; height: 400px; position: relative; margin: 25px auto; background: #f5f5f5; border: 3px solid #ddd; border-radius: 12px; padding: 15px;">
               
               <!-- Caixa superior -->
               <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 280px; height: 38px; background: white; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 6px;">
                PES + PDS (INTELECTUAL) = ${(resultado.NO || 0) + (resultado.NE || 0)}
              </div>
               
               <!-- Cérebro central - MAIOR e como background -->
               <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 250px; height: 200px; background-image: url('/cerebro2.png'); background-size: contain; background-repeat: no-repeat; background-position: center; z-index: 1;"></div>

              <!-- Laterais verticais -->
               <div style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 70px; height: 200px; background: rgba(255,255,255,0.9); border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border-radius: 6px; padding: 4px; z-index: 2;">
                 <div style="transform: rotate(-90deg); white-space: nowrap; line-height: 1.0; text-align: center;">
                   PEI + PES (TÉCNICO OPERACIONAL) = ${(resultado.SO || 0) + (resultado.NO || 0)}
                 </div>
               </div>
               <div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 70px; height: 200px; background: rgba(255,255,255,0.9); border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border-radius: 6px; padding: 4px; z-index: 2;">
                 <div style="transform: rotate(90deg); white-space: nowrap; line-height: 1.0; text-align: center;">
                   PDI + PDS (CRIATIVO INTERPESSOAL) = ${(resultado.SE || 0) + (resultado.NE || 0)}
                 </div>
               </div>
               
               <!-- Labels das categorias -->
               <div style="position: absolute; top: 70px; left: 65px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">LÓGICO</div>
               <div style="position: absolute; top: 70px; right: 65px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">CRIATIVO</div>
               <div style="position: absolute; bottom: 70px; left: 45px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">ORGANIZADO</div>
               <div style="position: absolute; bottom: 70px; right: 35px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">COMUNICATIVO</div>
              
              <!-- Boxes dos cantos -->
               <div style="position: absolute; top: 60px; left: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PES</div>
                <div>${resultado.NO || 0}</div>
              </div>
               <div style="position: absolute; top: 60px; right: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PDS</div>
                <div>${resultado.NE || 0}</div>
              </div>
               <div style="position: absolute; bottom: 60px; left: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PEI</div>
                <div>${resultado.SO || 0}</div>
              </div>
               <div style="position: absolute; bottom: 60px; right: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
                <div>PDI</div>
                <div>${resultado.SE || 0}</div>
              </div>
              
               <!-- Caixa inferior -->
               <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 280px; height: 38px; background: white; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 6px;">
                PEI + PDI (OPERACIONAL) = ${(resultado.SO || 0) + (resultado.SE || 0)}
              </div>
            </div>
          </div>
          
           <!-- Pré-frontal do Hemisfério Cerebral Esquerdo -->
           <div style="margin: 20px 0; page-break-inside: avoid;">
             <h2 style="color: #333; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Pré-frontal do Hemisfério Cerebral Esquerdo</h2>
             
             <h3 style="color: #555; font-size: 14px; margin: 15px 0 8px 0;">PESuperior - Lógico-racional (郏輯理性 合理 – Luojí lǐxìng Hélǐ de)</h3>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               A lógica é de fundamental importância para a racionalidade humana e é de particularidade humana, que nos diferencia dos animais. 
               Lógica tem origem na palavra grega logos, que significa razão, argumentação ou fala.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               Os racionais têm uma capacidade de dedução lógica muito forte, são capazes de tirar grandes conclusões a partir de pequenos fatos. 
               Capacidade para o uso da razão e do pensamento lógico para analisar situações e tomar decisões e resolver problemas.
             </p>
             <p style="font-size: 14px; font-weight: bold; color: #007bff;">Pontuação: ${resultado.NO || 0}</p>
             
             <h3 style="color: #555; font-size: 14px; margin: 15px 0 8px 0;">PEInferior - Organizado (有組織 Yǒu zǔzhī)</h3>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               Ser uma pessoa organizada significa manter a ordem em diversas áreas da vida, seja no seu habitat ou ambiente físico pessoal e profissional. 
               Uma pessoa organizada consegue otimizar seus recursos, evitar o caos e aumentar a eficiência em suas atividades diárias.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               A organização pessoal desempenha um papel fundamental na busca por tempo de qualidade em várias áreas da vida e pode ser definida 
               como o processo de gerenciar e priorizar tarefas, metas e responsabilidades pessoais e profissionais de forma eficiente e eficaz.
             </p>
             <p style="font-size: 14px; font-weight: bold; color: #007bff;">Pontuação: ${resultado.SO || 0}</p>
            </div>

           <!-- Pré-frontal do Hemisfério Cerebral Direito -->
           <div style="margin: 20px 0; page-break-inside: avoid;">
             <h2 style="color: #333; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Pré-frontal do Hemisfério Cerebral Direito</h2>
             
             <h3 style="color: #555; font-size: 14px; margin: 15px 0 8px 0;">PDSupeior - Criativo (創造力 – chuàngzào lì)</h3>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               É uma Disrupção, uma Habilidade de gerar ideias originais e inovadoras. Caracteriza por: ser imaginativo, inventivo, 
               capacidade de criar, inovar, engenhoso, fértil, competência de ser próspero e produtivo.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               O potencial criativo é uma força dinâmica e relaciona com o instinto de sobrevivência, é uma capacidade inerente a todos 
               os seres humanos de gerar ideias originais, soluções inovadoras e expressões únicas para um problema ou situação.
             </p>
             <p style="font-size: 14px; font-weight: bold; color: #007bff;">Pontuação: ${resultado.NE || 0}</p>
             
             <h3 style="color: #555; font-size: 14px; margin: 15px 0 8px 0;">PDInferior - Comunicativo (善於溝通 – Shànyú gōutōng)</h3>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               É um tipo de habilidade com tendência ou vocação para comunicar a si próprio ou ao seu redor, é sociável, expansivo, 
               expressando ideias, sentimentos e informações de forma clara e eficaz.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               Destacam por sua habilidade de criar identificação, simulação, conexões, influenciar e motivar. Capacidade de incentivar 
               a aproximação das pessoas, através da sua extroversão, empatia e persuasão.
             </p>
             <p style="font-size: 14px; font-weight: bold; color: #007bff;">Pontuação: ${resultado.SE || 0}</p>
          </div>
          
           <!-- Análise Final -->
           <div style="margin: 30px 0; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
             <p style="font-size: 14px; text-align: justify; margin-bottom: 10px; font-weight: bold;">
               Para um funcionamento harmonioso do pré frontal do cérebro, a pontuação deve ser 8 em cada área avaliada.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               Este gráfico/cérebro resultante do questionário mostra como você vem utilizando destes recursos ou demonstra uma característica sua.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               A partir do teste prático, demonstra que a sua tomada de decisão é feita a partir das metas/objetivos claros e definidos criando assim um parâmetro para também utilizar suas próprias regras.
             </p>
        </div>

           <!-- Livre Arbítrio e Neurociência -->
           <div style="margin: 20px 0; page-break-inside: avoid;">
             <h2 style="color: #333; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Livre Arbítrio e Neurociência</h2>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               Livre arbítrio é a base da decisão do Homo sapiens único animal do planeta que possui esta capacidade de decisão, entretanto a Neurociência descobriu que sempre usamos padrões de referência do passado para processar o futuro. O que chamamos de livre arbítrio está comprometido pelo novo conceito da neurociência.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               Então, como podemos tomar decisões mais assertivas e mudar o destino e curso de nossas vidas? Através da mudança de Crenças e Valores impressos no Cérebro Direito que processam Imagens e Sensações.
             </p>
           </div>

           <!-- Coaching Holístico SH -->
           <div style="margin: 20px 0; page-break-inside: avoid;">
             <h2 style="color: #333; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Coaching Holístico SH</h2>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               O Coaching Holístico SH é uma ferramenta desenvolvida pelo Dr. Jou Eel Jia baseada na MTC (Medicina Tradicional Chinesa) e na moderna Neurociência, tem como objetivo extrair as crenças e valores gravados em forma de imagens e sensações através das experiências produzidas no passado.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               A partir da identificação das crenças e valores (Bloqueadores/Sabotadores) do Cérebro Direito traduzido em linguística para o Cérebro Esquerdo, a pessoa toma consciência pois muitas vezes o Cérebro Esquerdo sofre a influência continuada do Cérebro Direito que podemos chamar de inconsciência. Esta consciência permite ao coachee os ajustes necessários à compatibilização de suas decisões aos seus objetivos.
             </p>
             <p style="font-size: 12px; text-align: justify; margin-bottom: 10px; word-wrap: break-word; hyphens: auto;">
               Na Medicina Tradicional Chinesa, os bloqueadores funcionam como estagnação de nossa energia primordial.
             </p>
           </div>

           <!-- Footer -->
           <div style="margin-top: 40px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px;">
             <p style="font-size: 12px; color: #666;">Coaching Holístico Shiou Hsing</p>
           </div>
         </div>
       `;

       document.body.appendChild(tempDiv);

       try {
         // Converter para canvas
         const canvas = await html2canvas(tempDiv, {
           scale: 2,
           useCORS: true,
           allowTaint: true,
           backgroundColor: '#ffffff'
         });

         // Criar PDF
         const pdf = new jsPDF('p', 'mm', 'a4');
         const imgData = canvas.toDataURL('image/png');
         
         const imgWidth = 210; // A4 width in mm
         const pageHeight = 295; // A4 height in mm
         const imgHeight = (canvas.height * imgWidth) / canvas.width;
         let heightLeft = imgHeight;

         let position = 0;

         // Adicionar primeira página
         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
         heightLeft -= pageHeight;

         // Adicionar páginas extras se necessário
         while (heightLeft >= 0) {
           position = heightLeft - imgHeight;
           pdf.addPage();
           pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
           heightLeft -= pageHeight;
         }

         // Salvar PDF
         pdf.save(`Devolutiva_Cliente_${cliente.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);

       } catch (error) {
         console.error('Erro ao gerar PDF:', error);
         alert('Erro ao gerar PDF. Tente novamente.');
       } finally {
         // Remover elemento temporário
         document.body.removeChild(tempDiv);
       }
     };

     generatePDF();
  };

  // Função para gerar resumo simples
  const gerarResumo = (item) => {
    const { cliente, questionario } = item;
    const resultado = questionario.resultado;

    const generatePDF = async () => {
      // Criar elemento temporário para renderizar o conteúdo
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '750px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; color: #333; text-align: center;">
          <!-- Nome do Cliente -->
          <h1 style="margin: 0 0 40px 0; font-size: 24px; color: #333;">${cliente.nome}</h1>
          
          <!-- Mapeamento Cerebral -->
          <div style="width: 600px; height: 400px; position: relative; margin: 0 auto; background: #f5f5f5; border: 3px solid #ddd; border-radius: 12px; padding: 15px;">
            
            <!-- Caixa superior -->
            <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 280px; height: 38px; background: white; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 6px;">
             PES + PDS (INTELECTUAL) = ${(resultado.NO || 0) + (resultado.NE || 0)}
           </div>
            
            <!-- Cérebro central -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 250px; height: 200px; background-image: url('/cerebro2.png'); background-size: contain; background-repeat: no-repeat; background-position: center; z-index: 1;"></div>

           <!-- Laterais verticais -->
            <div style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 70px; height: 200px; background: rgba(255,255,255,0.9); border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border-radius: 6px; padding: 4px; z-index: 2;">
              <div style="transform: rotate(-90deg); white-space: nowrap; line-height: 1.0; text-align: center;">
                PEI + PES (TÉCNICO OPERACIONAL) = ${(resultado.SO || 0) + (resultado.NO || 0)}
              </div>
            </div>
            <div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 70px; height: 200px; background: rgba(255,255,255,0.9); border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border-radius: 6px; padding: 4px; z-index: 2;">
              <div style="transform: rotate(90deg); white-space: nowrap; line-height: 1.0; text-align: center;">
                PDI + PDS (CRIATIVO INTERPESSOAL) = ${(resultado.SE || 0) + (resultado.NE || 0)}
              </div>
            </div>
            
            <!-- Labels das categorias -->
            <div style="position: absolute; top: 70px; left: 65px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">LÓGICO</div>
            <div style="position: absolute; top: 70px; right: 65px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">CRIATIVO</div>
            <div style="position: absolute; bottom: 70px; left: 45px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">ORGANIZADO</div>
            <div style="position: absolute; bottom: 70px; right: 35px; font-size: 11px; font-weight: bold; background: #333; color: white; padding: 5px 8px; border-radius: 12px; z-index: 3;">COMUNICATIVO</div>
           
           <!-- Boxes dos cantos -->
            <div style="position: absolute; top: 60px; left: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
             <div>PES</div>
             <div>${resultado.NO || 0}</div>
           </div>
            <div style="position: absolute; top: 60px; right: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
             <div>PDS</div>
             <div>${resultado.NE || 0}</div>
           </div>
            <div style="position: absolute; bottom: 60px; left: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
             <div>PEI</div>
             <div>${resultado.SO || 0}</div>
           </div>
            <div style="position: absolute; bottom: 60px; right: 140px; width: 70px; height: 40px; background: rgba(255,255,255,0.95); border: 2px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border-radius: 8px; z-index: 3;">
             <div>PDI</div>
             <div>${resultado.SE || 0}</div>
           </div>
           
            <!-- Caixa inferior -->
            <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 280px; height: 38px; background: white; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 6px;">
             PEI + PDI (OPERACIONAL) = ${(resultado.SO || 0) + (resultado.SE || 0)}
           </div>
         </div>
        </div>
       `;

      document.body.appendChild(tempDiv);

      try {
        // Converter para canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        // Criar PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Adicionar primeira página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Adicionar páginas extras se necessário
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Salvar PDF
        pdf.save(`Resumo_${cliente.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);

       } catch (error) {
         console.error('Erro ao gerar PDF:', error);
         alert('Erro ao gerar PDF. Tente novamente.');
       } finally {
         // Remover elemento temporário
         document.body.removeChild(tempDiv);
       }
     };

     generatePDF();
  };

  // Função para exportar em PDF (placeholder)
  const exportarPDF = (item, tipo) => {
    if (tipo === 'Relatório') {
      gerarRelatorioDrJou(item);
    } else if (tipo === 'DevolutivaCliente') {
      gerarDevolutivaCliente(item);
    } else if (tipo === 'Resumo') {
      gerarResumo(item);
    } else {
      alert(`Exportando ${tipo} para ${item.cliente.nome} - Em desenvolvimento`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
        <p>Carregando questionários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard Gerente - Questionários
            </h1>
            <p className="text-gray-600">
              Gerencie os questionários preenchidos pelos clientes
            </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1, backgroundColor: '#dbeafe', padding: '24px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e40af', margin: 0 }}>Total de Questionários</h3>
            <select 
              value={filtroTempo}
              onChange={(e) => setFiltroTempo(e.target.value)}
              style={{ 
                padding: '4px 8px', 
                fontSize: '12px', 
                border: '1px solid #3b82f6', 
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#1e40af'
              }}
            >
              <option value="todos">Todos</option>
              <option value="1semana">Última semana</option>
              <option value="1mes">Último mês</option>
            </select>
          </div>
          <p style={{ fontSize: '30px', fontWeight: '700', color: '#2563eb', margin: '0' }}>
            {filtrarPorTempo(questionarios, filtroTempo).length}
          </p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fee2e2', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: 0 }}>Aguardando Resposta</h3>
          <p style={{ fontSize: '30px', fontWeight: '700', color: '#dc2626', margin: '8px 0 0 0' }}>
            {questionarios.filter(q => !q.questionario?.testeTiro || Object.values(q.questionario?.testeTiro || {}).every(v => !v)).length}
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nome, email ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Lista de Questionários */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Questionários Preenchidos</h2>
        </div>
        
        {questionariosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {busca ? 'Nenhum questionário encontrado com os filtros aplicados.' : 'Nenhum questionário preenchido ainda.'}
          </div>
        ) : (
          <div className="divide-y">
            {questionariosFiltrados.map((item) => (
              <div key={item.cliente._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{item.cliente.nome}</h3>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p><span className="font-medium">Email:</span> {item.cliente.email || 'Não informado'}</p>
                      <p><span className="font-medium">CPF:</span> {item.cliente.cpf}</p>
                      <p><span className="font-medium">Preenchido em:</span> {new Date(item.dataPreenchimento).toLocaleDateString('pt-BR')}</p>
                      {item.questionario?.resultado && (
                        <p><span className="font-medium">Tipo Predominante:</span> <span className="font-semibold text-blue-600">{item.questionario.resultado.tipoPredominante}</span></p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <button
                      onClick={() => visualizarQuestionario(item)}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#166534', '&:hover': { backgroundColor: '#14532d' } }}
                    >
                      Visualizar Cérebro
                    </button>
                    <button
                      onClick={() => editarQuestionario(item)}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: item.questionario.editado ? '#166534' : '#d97706',
                        borderLeft: item.questionario.editado ? '4px solid #16a34a' : '4px solid #f59e0b'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = item.questionario.editado ? '#14532d' : '#b45309';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = item.questionario.editado ? '#166534' : '#d97706';
                      }}
                      title={item.questionario.editado ? 'Já foi editado' : 'Nunca foi editado'}
                    >
                      Editar {item.questionario.editado ? '✓' : '!'}
                    </button>
                    <button
                      onClick={() => exportarPDF(item, 'Relatório')}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#166534' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#14532d'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#166534'}
                    >
                      Direcionamento Dr Jou
                    </button>
                    <button
                      onClick={() => exportarPDF(item, 'DevolutivaCliente')}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#166534' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#14532d'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#166534'}
                    >
                      Devolutiva Cliente
                    </button>
                    <button
                      onClick={() => exportarPDF(item, 'Resumo')}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#166534' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#14532d'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#166534'}
                    >
                      Material Profissional
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
      {showBrainModal && questionarioSelecionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowBrainModal(false);
                setQuestionarioSelecionado(null);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333', textAlign: 'center' }}>
              <h1 style={{ margin: '0 0 40px 0', fontSize: '24px', color: '#333' }}>
                {questionarioSelecionado.cliente.nome}
              </h1>
              
              <div style={{ width: '600px', height: '400px', position: 'relative', margin: '0 auto', background: '#f5f5f5', border: '3px solid #ddd', borderRadius: '12px', padding: '15px' }}>
                
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '280px', height: '38px', background: 'white', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px' }}>
                  PES + PDS (INTELECTUAL) = {(questionarioSelecionado.questionario.resultado.NO || 0) + (questionarioSelecionado.questionario.resultado.NE || 0)}
                </div>
                
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '200px', backgroundImage: 'url(\'/cerebro2.png\')', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', zIndex: 1 }}></div>

                <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '70px', height: '200px', background: 'rgba(255,255,255,0.9)', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', borderRadius: '6px', padding: '4px', zIndex: 2 }}>
                  <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', lineHeight: '1.0', textAlign: 'center' }}>
                    PEI + PES (TÉCNICO OPERACIONAL) = {(questionarioSelecionado.questionario.resultado.SO || 0) + (questionarioSelecionado.questionario.resultado.NO || 0)}
                  </div>
                </div>
                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '70px', height: '200px', background: 'rgba(255,255,255,0.9)', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', borderRadius: '6px', padding: '4px', zIndex: 2 }}>
                  <div style={{ transform: 'rotate(90deg)', whiteSpace: 'nowrap', lineHeight: '1.0', textAlign: 'center' }}>
                    PDI + PDS (CRIATIVO INTERPESSOAL) = {(questionarioSelecionado.questionario.resultado.SE || 0) + (questionarioSelecionado.questionario.resultado.NE || 0)}
                  </div>
                </div>
                
                <div style={{ position: 'absolute', top: '70px', left: '65px', fontSize: '11px', fontWeight: 'bold', background: '#333', color: 'white', padding: '5px 8px', borderRadius: '12px', zIndex: 3 }}>LÓGICO</div>
                <div style={{ position: 'absolute', top: '70px', right: '65px', fontSize: '11px', fontWeight: 'bold', background: '#333', color: 'white', padding: '5px 8px', borderRadius: '12px', zIndex: 3 }}>CRIATIVO</div>
                <div style={{ position: 'absolute', bottom: '70px', left: '45px', fontSize: '11px', fontWeight: 'bold', background: '#333', color: 'white', padding: '5px 8px', borderRadius: '12px', zIndex: 3 }}>ORGANIZADO</div>
                <div style={{ position: 'absolute', bottom: '70px', right: '35px', fontSize: '11px', fontWeight: 'bold', background: '#333', color: 'white', padding: '5px 8px', borderRadius: '12px', zIndex: 3 }}>COMUNICATIVO</div>
               
                <div style={{ position: 'absolute', top: '60px', left: '140px', width: '70px', height: '40px', background: 'rgba(255,255,255,0.95)', border: '2px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', borderRadius: '8px', zIndex: 3 }}>
                  <div>PES</div>
                  <div>{questionarioSelecionado.questionario.resultado.NO || 0}</div>
                </div>
                <div style={{ position: 'absolute', top: '60px', right: '140px', width: '70px', height: '40px', background: 'rgba(255,255,255,0.95)', border: '2px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', borderRadius: '8px', zIndex: 3 }}>
                  <div>PDS</div>
                  <div>{questionarioSelecionado.questionario.resultado.NE || 0}</div>
                </div>
                <div style={{ position: 'absolute', bottom: '60px', left: '140px', width: '70px', height: '40px', background: 'rgba(255,255,255,0.95)', border: '2px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', borderRadius: '8px', zIndex: 3 }}>
                  <div>PEI</div>
                  <div>{questionarioSelecionado.questionario.resultado.SO || 0}</div>
                </div>
                <div style={{ position: 'absolute', bottom: '60px', right: '140px', width: '70px', height: '40px', background: 'rgba(255,255,255,0.95)', border: '2px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', borderRadius: '8px', zIndex: 3 }}>
                  <div>PDI</div>
                  <div>{questionarioSelecionado.questionario.resultado.SE || 0}</div>
                </div>
                
                <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '280px', height: '38px', background: 'white', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px' }}>
                  PEI + PDI (OPERACIONAL) = {(questionarioSelecionado.questionario.resultado.SO || 0) + (questionarioSelecionado.questionario.resultado.SE || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && questionarioEdicao && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowEditModal(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                zIndex: 10,
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              paddingRight: '40px', 
              paddingTop: '10px',
              color: '#333'
            }}>
              Editar Questionário - {questionarioEdicao.cliente.nome}
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.75rem',
                color: '#333'
              }}>
                Teste de Tiro
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={testeTiro.checkbox1}
                    onChange={(e) => setTesteTiro(prev => ({ ...prev, checkbox1: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#333' }}>1</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={testeTiro.checkbox2}
                    onChange={(e) => setTesteTiro(prev => ({ ...prev, checkbox2: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#333' }}>2</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={testeTiro.checkbox3}
                    onChange={(e) => setTesteTiro(prev => ({ ...prev, checkbox3: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#333' }}>3</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={testeTiro.checkbox4}
                    onChange={(e) => setTesteTiro(prev => ({ ...prev, checkbox4: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#333' }}>4</span>
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.75rem',
                color: '#333'
              }}>
                Comentário Livre
              </h4>
              <textarea
                value={comentarioLivre}
                onChange={(e) => setComentarioLivre(e.target.value)}
                placeholder="Digite seus comentários aqui..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  color: '#333'
                }}
                rows="4"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={salvarEdicao}
                style={{ 
                  flex: 1,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#166534',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#14532d'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#166534'}
              >
                Salvar
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ 
                  flex: 1,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#166534',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#14532d'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#166534'}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenteDashboard;
