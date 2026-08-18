import './ConnectionStatus.css';

interface ConnectionStatusProps {
  connected: boolean;
}

export default function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
      <span className="connection-dot" />
      {!connected && <span className="connection-label">Desconectado</span>}
    </div>
  );
}
