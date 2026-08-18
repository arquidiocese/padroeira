import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './ItemTypeManager.css';

interface Station {
  id: number;
  name: string;
}

interface ItemType {
  id: number;
  name: string;
  station_id: number | null;
  default_ingredients: string[];
}

export default function ItemTypeManager() {
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [newName, setNewName] = useState('');
  const [newStationId, setNewStationId] = useState<number | ''>('');
  const [newIngredients, setNewIngredients] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItemTypes = useCallback(async () => {
    try {
      const res = await api.get('/item-types');
      setItemTypes(res.data);
    } catch {
      setError('Erro ao carregar tipos de itens.');
    }
  }, []);

  const fetchStations = useCallback(async () => {
    try {
      const res = await api.get('/stations');
      setStations(res.data);
    } catch {
      // Stations will be empty
    }
  }, []);

  useEffect(() => {
    fetchItemTypes();
    fetchStations();
  }, [fetchItemTypes, fetchStations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) {
      setError('Nome do tipo de item e obrigatorio.');
      return;
    }

    const ingredients = newIngredients
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    setLoading(true);
    try {
      await api.post('/item-types', {
        name: newName.trim(),
        stationId: newStationId || null,
        defaultIngredients: ingredients,
      });
      setNewName('');
      setNewStationId('');
      setNewIngredients('');
      await fetchItemTypes();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao criar tipo de item.');
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = async (itemTypeId: number, stationId: number | null) => {
    setError('');
    try {
      await api.put(`/item-types/${itemTypeId}/station`, { stationId });
      await fetchItemTypes();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao associar estacao.');
    }
  };

  return (
    <section className="item-type-manager">
      <h2>Tipos de Itens</h2>

      {error && <div className="error-message" role="alert">{error}</div>}

      <form className="item-type-form" onSubmit={handleCreate}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Nome do tipo (ex: Pastel de Carne)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="Nome do novo tipo de item"
          />
          <select
            value={newStationId}
            onChange={(e) => setNewStationId(e.target.value ? Number(e.target.value) : '')}
            aria-label="Estacao do novo tipo de item"
          >
            <option value="">Sem estacao</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Ingredientes padrao (separados por virgula)"
            value={newIngredients}
            onChange={(e) => setNewIngredients(e.target.value)}
            aria-label="Ingredientes padrao do novo tipo de item"
            className="ingredients-input"
          />
          <button type="submit" disabled={loading}>
            Adicionar
          </button>
        </div>
      </form>

      <ul className="item-type-list">
        {itemTypes.map((itemType) => (
          <li key={itemType.id} className="item-type-item">
            <div className="item-type-info">
              <strong>{itemType.name}</strong>
              {itemType.default_ingredients.length > 0 && (
                <span className="item-type-ingredients">
                  {itemType.default_ingredients.join(', ')}
                </span>
              )}
            </div>
            <div className="item-type-station">
              <label htmlFor={`station-select-${itemType.id}`} className="sr-only">
                Estacao para {itemType.name}
              </label>
              <select
                id={`station-select-${itemType.id}`}
                value={itemType.station_id ?? ''}
                onChange={(e) =>
                  handleStationChange(
                    itemType.id,
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                aria-label={`Estacao para ${itemType.name}`}
              >
                <option value="">Sem estacao</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
        {itemTypes.length === 0 && (
          <li className="item-type-empty">Nenhum tipo de item cadastrado.</li>
        )}
      </ul>
    </section>
  );
}
