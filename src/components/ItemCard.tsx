import type { OrderItem, IngredientModification } from '../types/order';
import IngredientSelector from './IngredientSelector';
import './ItemCard.css';

interface ItemCardProps {
  item: OrderItem;
  index: number;
  onUpdateIngredients: (uid: string, ingredients: IngredientModification[]) => void;
  onRemove: (uid: string) => void;
  availableExtras?: string[];
}

export default function ItemCard({
  item,
  index,
  onUpdateIngredients,
  onRemove,
  availableExtras = [],
}: ItemCardProps) {
  return (
    <div className="item-card" aria-label={`Item ${index + 1}: ${item.itemTypeName}`}>
      <div className="item-card-header">
        <span className="item-position">#{index + 1}</span>
        <span className="item-type-name">{item.itemTypeName}</span>
        <button
          type="button"
          className="item-remove-btn"
          onClick={() => onRemove(item.uid)}
          aria-label={`Remover item ${index + 1}: ${item.itemTypeName}`}
        >
          X
        </button>
      </div>
      <div className="item-card-body">
        <IngredientSelector
          ingredients={item.modifications}
          onChange={(ingredients) => onUpdateIngredients(item.uid, ingredients)}
          availableExtras={availableExtras}
        />
      </div>
    </div>
  );
}
