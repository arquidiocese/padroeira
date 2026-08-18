import type { OrderItem } from '../types/order';
import './OrderSummary.css';

interface OrderSummaryProps {
  items: OrderItem[];
  onFinalize: () => void;
  isSubmitting: boolean;
}

const MAX_ITEMS = 50;

export default function OrderSummary({
  items,
  onFinalize,
  isSubmitting,
}: OrderSummaryProps) {
  const isEmpty = items.length === 0;
  const isFull = items.length >= MAX_ITEMS;

  return (
    <div className="order-summary">
      <h3 className="order-summary-title">Resumo do Pedido</h3>

      <div className="order-summary-count">
        <span>{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
        {isFull && <span className="limit-warning">Limite atingido (50)</span>}
      </div>

      {items.length > 0 && (
        <ul className="order-summary-list">
          {items.map((item, index) => {
            const removedCount = item.modifications.filter(
              (m) => m.modificationType === 'removed'
            ).length;
            const addedCount = item.modifications.filter(
              (m) => m.modificationType === 'added'
            ).length;

            return (
              <li key={item.uid} className="order-summary-item">
                <span className="summary-item-position">#{index + 1}</span>
                <span className="summary-item-name">{item.itemTypeName}</span>
                {(removedCount > 0 || addedCount > 0) && (
                  <span className="summary-item-mods">
                    {removedCount > 0 && (
                      <span className="mod-removed">-{removedCount}</span>
                    )}
                    {addedCount > 0 && (
                      <span className="mod-added">+{addedCount}</span>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className="finalize-btn"
        onClick={onFinalize}
        disabled={isEmpty || isSubmitting}
        aria-label="Finalizar pedido"
      >
        {isSubmitting ? 'Enviando...' : 'Finalizar Pedido'}
      </button>

      {isEmpty && (
        <p className="validation-message">
          Adicione ao menos um item para finalizar o pedido.
        </p>
      )}
    </div>
  );
}
