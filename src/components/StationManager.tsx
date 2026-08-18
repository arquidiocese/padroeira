import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './StationManager.css';

interface Printer {
  id: number;
  name: string;
  connection_type: string;
  address: string;
  is_default: number;
}

interface Station {
  id: number;
  name: string;
  printer_id: number;
  printer: Printer;
}

interface ItemType {
  id: number;
  name: string;
  station_id: number | null;
}

export default function StationManager() {
  const [stations, setStations] = useState<Station[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrinterId, setNewPrinterId] = useState<number | ''>('');
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrinterId, setEditPrinterId] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ stationId: number; items: ItemType[] } | null>(null);

  const fetchStations = useCallback(async () => {
    try {
      const res = await api.get('/stations');
      setStations(res.data);
    } catch {
      setError('Erro ao carregar estacoes.');
    }
  }, []);

  const fetchPrinters = useCallback(async () => {
    try {
      const res = await api.get('/stations');
      const stationData: Station[] = res.data;
      const printerMap = new Map<number, Printer>();
      stationData.forEach((s) => {
        printerMap.set(s.printer.id, s.printer);
      });

      try {
        const defaultRes = await api.get('/config/printer');
        if (defaultRes.data) {
          printerMap.set(defaultRes.data.id, defaultRes.data);
        }
      } catch {
        // No default printer configured
      }

      setPrinters(Array.from(printerMap.values()));
    } catch {
      // Printers will be empty
    }
  }, []);

  useEffect(() => {
    fetchStations();
    fetchPrinters();
  }, [fetchStations, fetchPrinters]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) {
      setError('Nome da estacao e obrigatorio.');
      return;
    }

    if (!newPrinterId) {
      setError('Selecione uma impressora.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/stations', { name: newName.trim(), printerId: newPrinterId });
      setNewName('');
      setNewPrinterId('');
      await fetchStations();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao criar estacao.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (stationId: number) => {
    setError('');

    if (!editName.trim()) {
      setError('Nome da estacao e obrigatorio.');
      return;
    }

    if (!editPrinterId) {
      setError('Selecione uma impressora.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/stations/${stationId}`, { name: editName.trim(), printerId: editPrinterId });
      setEditingId(null);
      await fetchStations();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao atualizar estacao.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (stationId: number) => {
    setError('');
    try {
      const res = await api.get('/item-types');
      const itemTypes: ItemType[] = res.data;
      const associatedItems = itemTypes.filter((it) => it.station_id === stationId);

      if (associatedItems.length > 0) {
        setConfirmDelete({ stationId, items: associatedItems });
      } else {
        await performDelete(stationId);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao verificar itens associados.');
    }
  };

  const performDelete = async (stationId: number) => {
    setLoading(true);
    try {
      await api.delete(`/stations/${stationId}`);
      setConfirmDelete(null);
      await fetchStations();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao remover estacao.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (station: Station) => {
    setEditingId(station.id);
    setEditName(station.name);
    setEditPrinterId(station.printer_id);
    setError('');
  };

  return (
    <section className="station-manager">
      <h2>Estacoes de Preparo</h2>

      {error && <div className="error-message" role="alert">{error}</div>}

      <form className="station-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nome da estacao"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={50}
          aria-label="Nome da nova estacao"
        />
        <select
          value={newPrinterId}
          onChange={(e) => setNewPrinterId(e.target.value ? Number(e.target.value) : '')}
          aria-label="Impressora da nova estacao"
        >
          <option value="">Selecione impressora</option>
          {printers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.address})
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          Adicionar
        </button>
      </form>

      <ul className="station-list">
        {stations.map((station) => (
          <li key={station.id} className="station-item">
            {editingId === station.id ? (
              <div className="station-edit">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  aria-label="Editar nome da estacao"
                />
                <select
                  value={editPrinterId}
                  onChange={(e) => setEditPrinterId(e.target.value ? Number(e.target.value) : '')}
                  aria-label="Editar impressora da estacao"
                >
                  <option value="">Selecione impressora</option>
                  {printers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.address})
                    </option>
                  ))}
                </select>
                <button onClick={() => handleUpdate(station.id)} disabled={loading}>
                  Salvar
                </button>
                <button onClick={() => setEditingId(null)} className="btn-cancel">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="station-display">
                <div className="station-info">
                  <strong>{station.name}</strong>
                  <span className="station-printer">
                    {station.printer.name}
                  </span>
                </div>
                <div className="station-actions">
                  <button onClick={() => startEditing(station)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteRequest(station.id)} className="btn-delete">
                    Remover
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {stations.length === 0 && (
          <li className="station-empty">Nenhuma estacao cadastrada.</li>
        )}
      </ul>

      {confirmDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div className="modal-content">
            <h3 id="confirm-delete-title">Confirmar Remocao</h3>
            <p>
              Esta estacao possui <strong>{confirmDelete.items.length}</strong> tipo(s) de item associado(s):
            </p>
            <ul className="confirm-items-list">
              {confirmDelete.items.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
            <p>Ao remover, esses itens ficarao sem estacao associada. Deseja continuar?</p>
            <div className="modal-actions">
              <button onClick={() => performDelete(confirmDelete.stationId)} className="btn-delete">
                Sim, remover
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
