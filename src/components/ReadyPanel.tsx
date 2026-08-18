import { useEffect, useState } from 'react';
import { useWebSocket } from '../providers/WebSocketProvider';
import ConnectionStatus from './ConnectionStatus';
import './ReadyPanel.css';

const MAX_ORDERS = 20;

export default function ReadyPanel() {
  const { socket, connected } = useWebSocket();
  const [orders, setOrders] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleInitialOrders = (data: { orders: string[] }) => {
      setOrders(data.orders.slice(0, MAX_ORDERS));
    };

    const handleOrderReady = (data: { orderNumber: string }) => {
      setOrders((prev) => {
        if (prev.includes(data.orderNumber)) return prev;
        const updated = [...prev, data.orderNumber];
        return updated.slice(-MAX_ORDERS);
      });
    };

    const handleOrderPickedUp = (data: { orderNumber: string }) => {
      setOrders((prev) => prev.filter((n) => n !== data.orderNumber));
    };

    socket.on('initial:ready-orders', handleInitialOrders);
    socket.on('order:ready', handleOrderReady);
    socket.on('order:picked-up', handleOrderPickedUp);

    return () => {
      socket.off('initial:ready-orders', handleInitialOrders);
      socket.off('order:ready', handleOrderReady);
      socket.off('order:picked-up', handleOrderPickedUp);
    };
  }, [socket]);

  const sizeClass = orders.length <= 4
    ? 'size-xl'
    : orders.length <= 9
      ? 'size-lg'
      : orders.length <= 16
        ? 'size-md'
        : 'size-sm';

  return (
    <div className="ready-panel">
      <ConnectionStatus connected={connected} />
      <header className="ready-panel-header">
        <h1>Pedidos Prontos</h1>
      </header>
      <div className={`ready-panel-grid ${sizeClass}`}>
        {orders.map((orderNumber) => (
          <div key={orderNumber} className="order-number-card">
            <span className="order-number">{orderNumber}</span>
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <div className="ready-panel-empty">
          <p>Nenhum pedido pronto</p>
        </div>
      )}
    </div>
  );
}
