import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './PrinterConfig.css';

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

export default function PrinterConfig() {
  const [defaultPrinter, setDefaultPrinter] = useState<Printer | null>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPrinters = useCallback(async () => {
    try {
      const stationsRes = await api.get('/stations');
      const stationData: Station[] = stationsRes.data;
      const printerMap = new Map<number, Printer>();

      stationData.forEach((s) => {
        printerMap.set(s.printer.id, s.printer);
      });

      try {
        const defaultRes = await api.get('/config/printer');
        if (defaultRes.data) {
          printerMap.set(defaultRes.data.id, defaultRes.data);
          setDefaultPrinter(defaultRes.data);
          setSelectedPrinterId(defaultRes.data.id);
        }
      } catch {
        setDefaultPrinter(null);
      }

      setPrinters(Array.from(printerMap.values()));
    } catch {
      setError('Erro ao carregar impressoras.');
    }
  }, []);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  const handleSetDefault = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPrinterId) {
      setError('Selecione uma impressora.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/config/printer', { printerId: selectedPrinterId });
      setDefaultPrinter(res.data);
      setSuccess('Impressora padrao atualizada com sucesso.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erro ao definir impressora padrao.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="printer-config">
      <h2>Configuracao de Impressoras</h2>

      {error && <div className="error-message" role="alert">{error}</div>}
      {success && <div className="success-message" role="status">{success}</div>}

      <div className="printer-current">
        <h3>Impressora Padrao</h3>
        {defaultPrinter ? (
          <div className="printer-info">
            <span className="printer-name">{defaultPrinter.name}</span>
            <span className="printer-address">{defaultPrinter.connection_type}: {defaultPrinter.address}</span>
          </div>
        ) : (
          <p className="no-printer">Nenhuma impressora padrao configurada.</p>
        )}
      </div>

      <form className="printer-form" onSubmit={handleSetDefault}>
        <label htmlFor="default-printer-select">Alterar impressora padrao:</label>
        <div className="printer-form-row">
          <select
            id="default-printer-select"
            value={selectedPrinterId}
            onChange={(e) => setSelectedPrinterId(e.target.value ? Number(e.target.value) : '')}
            aria-label="Selecionar impressora padrao"
          >
            <option value="">Selecione uma impressora</option>
            {printers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.connection_type}: {p.address}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading || !selectedPrinterId}>
            Definir como Padrao
          </button>
        </div>
      </form>

      {printers.length > 0 && (
        <div className="printer-list-section">
          <h3>Impressoras Disponiveis</h3>
          <ul className="printer-list">
            {printers.map((p) => (
              <li key={p.id} className="printer-list-item">
                <div className="printer-list-info">
                  <strong>{p.name}</strong>
                  <span className="printer-detail">
                    {p.connection_type}: {p.address}
                  </span>
                </div>
                {p.is_default === 1 && (
                  <span className="printer-badge">Padrao</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
