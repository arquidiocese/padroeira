import './OrderConfirmation.css';

interface OrderConfirmationProps {
  orderNumber: number;
  printErrors?: string[];
  onClose: () => void;
}

export default function OrderConfirmation({
  orderNumber,
  printErrors = [],
  onClose,
}: OrderConfirmationProps) {
  return (
    <div className="order-confirmation-overlay" role="dialog" aria-modal="true" aria-label="Confirmacao do pedido">
      <div className="order-confirmation-modal">
        <div className="confirmation-icon">&#10004;</div>
        <h2 className="confirmation-title">Pedido Registrado!</h2>
        <div className="confirmation-number">
          <span className="number-label">Numero do Pedido</span>
          <span className="number-value">{orderNumber}</span>
        </div>

        {printErrors.length > 0 && (
          <div className="print-errors">
            <p className="print-errors-title">Erros de impressao:</p>
            <ul className="print-errors-list">
              {printErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          className="confirmation-close-btn"
          onClick={onClose}
          autoFocus
        >
          Novo Pedido
        </button>
      </div>
    </div>
  );
}
