import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type {
  ItemType,
  OrderItem,
  IngredientModification,
  CreateOrderPayload,
  OrderResponse,
} from '../types/order';
import ItemCard from './ItemCard';
import OrderSummary from './OrderSummary';
import OrderConfirmation from './OrderConfirmation';
import './OrderBuilder.css';

const MAX_ITEMS = 50;

export default function OrderBuilder() {
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    orderNumber: number;
    printErrors: string[];
  } | null>(null);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    loadItemTypes();
  }, []);

  const loadItemTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await api.get<ItemType[]>('/item-types');
      setItemTypes(response.data);
    } catch {
      setError('Erro ao carregar tipos de itens. Verifique a conexao com o servidor.');
    } finally {
      setLoadingTypes(false);
    }
  };

  const generateUid = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleAddItem = useCallback(
    (itemType: ItemType) => {
      if (items.length >= MAX_ITEMS) return;

      const defaultModifications: IngredientModification[] =
        itemType.default_ingredients.map((ing) => ({
          ingredientName: ing.ingredient_name,
          modificationType: 'included',
        }));

      const newItem: OrderItem = {
        uid: generateUid(),
        itemTypeId: itemType.id,
        itemTypeName: itemType.name,
        modifications: defaultModifications,
      };

      setItems((prev) => [...prev, newItem]);
      setError(null);
    },
    [items.length]
  );

  const handleUpdateIngredients = useCallback(
    (uid: string, ingredients: IngredientModification[]) => {
      setItems((prev) =>
        prev.map((item) =>
          item.uid === uid ? { ...item, modifications: ingredients } : item
        )
      );
    },
    []
  );

  const handleRemoveItem = useCallback((uid: string) => {
    setItems((prev) => prev.filter((item) => item.uid !== uid));
  }, []);

  const handleFinalize = async () => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    const payload: CreateOrderPayload = {
      items: items.map((item) => ({
        itemTypeId: item.itemTypeId,
        modifications: item.modifications.map((mod) => ({
          ingredientName: mod.ingredientName,
          modificationType: mod.modificationType,
        })),
      })),
    };

    try {
      const response = await api.post<OrderResponse>('/orders', payload);
      const { order_number, printErrors } = response.data;

      setConfirmation({
        orderNumber: order_number,
        printErrors: printErrors || [],
      });
      setItems([]);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(
          axiosErr.response?.data?.error ||
            'Erro ao finalizar pedido. Tente novamente.'
        );
      } else {
        setError('Erro de conexao. Verifique se o servidor esta ativo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmation(null);
  };

  const getAllExtras = (): string[] => {
    const allIngredients = new Set<string>();
    itemTypes.forEach((type) => {
      type.default_ingredients.forEach((ing) => {
        allIngredients.add(ing.ingredient_name);
      });
    });
    return Array.from(allIngredients);
  };

  const availableExtras = getAllExtras();
  const isFull = items.length >= MAX_ITEMS;

  return (
    <div className="order-builder">
      <div className="order-builder-main">
        <section className="item-type-selector">
          <h2>Adicionar Item</h2>
          {loadingTypes ? (
            <p className="loading-text">Carregando tipos de itens...</p>
          ) : (
            <div className="item-type-grid">
              {itemTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className="item-type-btn"
                  onClick={() => handleAddItem(type)}
                  disabled={isFull}
                  aria-label={`Adicionar ${type.name}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          )}
          {isFull && (
            <p className="limit-message">
              Limite de 50 itens atingido. Finalize o pedido ou remova itens.
            </p>
          )}
        </section>

        {error && (
          <div className="order-error" role="alert">
            {error}
          </div>
        )}

        <section className="items-list">
          <h2>Itens do Pedido ({items.length})</h2>
          {items.length === 0 ? (
            <p className="empty-message">
              Nenhum item adicionado. Selecione um tipo acima para comecar.
            </p>
          ) : (
            <div className="items-grid">
              {items.map((item, index) => (
                <ItemCard
                  key={item.uid}
                  item={item}
                  index={index}
                  onUpdateIngredients={handleUpdateIngredients}
                  onRemove={handleRemoveItem}
                  availableExtras={availableExtras}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="order-builder-sidebar">
        <OrderSummary
          items={items}
          onFinalize={handleFinalize}
          isSubmitting={isSubmitting}
        />
      </aside>

      {confirmation && (
        <OrderConfirmation
          orderNumber={confirmation.orderNumber}
          printErrors={confirmation.printErrors}
          onClose={handleCloseConfirmation}
        />
      )}
    </div>
  );
}
