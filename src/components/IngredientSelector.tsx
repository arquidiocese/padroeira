import type { IngredientModification } from '../types/order';
import './IngredientSelector.css';

interface IngredientSelectorProps {
  ingredients: IngredientModification[];
  onChange: (ingredients: IngredientModification[]) => void;
  availableExtras?: string[];
}

export default function IngredientSelector({
  ingredients,
  onChange,
  availableExtras = [],
}: IngredientSelectorProps) {
  const handleToggle = (index: number) => {
    const updated = [...ingredients];
    const current = updated[index];
    if (current.modificationType === 'included') {
      updated[index] = { ...current, modificationType: 'removed' };
    } else if (current.modificationType === 'removed') {
      updated[index] = { ...current, modificationType: 'included' };
    }
    onChange(updated);
  };

  const handleAddExtra = (ingredientName: string) => {
    const alreadyExists = ingredients.some(
      (ing) => ing.ingredientName === ingredientName
    );
    if (alreadyExists) return;

    onChange([
      ...ingredients,
      { ingredientName, modificationType: 'added' },
    ]);
  };

  const handleRemoveExtra = (ingredientName: string) => {
    onChange(ingredients.filter((ing) => ing.ingredientName !== ingredientName));
  };

  const defaultIngredients = ingredients.filter(
    (ing) => ing.modificationType !== 'added'
  );
  const addedIngredients = ingredients.filter(
    (ing) => ing.modificationType === 'added'
  );

  const unusedExtras = availableExtras.filter(
    (extra) => !ingredients.some((ing) => ing.ingredientName === extra)
  );

  return (
    <div className="ingredient-selector">
      <div className="ingredient-group">
        <span className="ingredient-group-label">Ingredientes padrao:</span>
        {defaultIngredients.map((ing, index) => (
          <label
            key={ing.ingredientName}
            className={`ingredient-item ${ing.modificationType === 'removed' ? 'removed' : ''}`}
          >
            <input
              type="checkbox"
              checked={ing.modificationType === 'included'}
              onChange={() => handleToggle(index)}
              aria-label={`${ing.ingredientName} - ${ing.modificationType === 'included' ? 'incluido' : 'removido'}`}
            />
            <span className="ingredient-name">{ing.ingredientName}</span>
            {ing.modificationType === 'removed' && (
              <span className="modification-badge removed">X</span>
            )}
          </label>
        ))}
      </div>

      {addedIngredients.length > 0 && (
        <div className="ingredient-group">
          <span className="ingredient-group-label">Adicionados:</span>
          {addedIngredients.map((ing) => (
            <div key={ing.ingredientName} className="ingredient-item added">
              <span className="modification-badge added">+</span>
              <span className="ingredient-name">{ing.ingredientName}</span>
              <button
                type="button"
                className="remove-extra-btn"
                onClick={() => handleRemoveExtra(ing.ingredientName)}
                aria-label={`Remover ${ing.ingredientName}`}
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {unusedExtras.length > 0 && (
        <div className="ingredient-group extras">
          <span className="ingredient-group-label">Adicionar extra:</span>
          <div className="extras-list">
            {unusedExtras.map((extra) => (
              <button
                key={extra}
                type="button"
                className="add-extra-btn"
                onClick={() => handleAddExtra(extra)}
              >
                + {extra}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
