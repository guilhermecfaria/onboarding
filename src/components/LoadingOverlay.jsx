import React from 'react';
import './LoadingOverlay.css';

/**
 * Componente para exibir um indicador de carregamento sobre um elemento
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.loading - Indica se o carregamento está ativo
 * @param {React.ReactNode} props.children - Elementos filhos
 * @param {string} [props.message] - Mensagem opcional para exibir durante o carregamento
 * @param {string} [props.className] - Classes CSS adicionais para o container
 */
const LoadingOverlay = ({ loading, children, message, className = '' }) => {
  return (
    <div className={`loading-overlay-container ${className}`}>
      {children}
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          {message && <div className="loading-message">{message}</div>}
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay; 