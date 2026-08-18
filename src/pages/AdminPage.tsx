import StationManager from '../components/StationManager';
import ItemTypeManager from '../components/ItemTypeManager';
import PrinterConfig from '../components/PrinterConfig';
import './AdminPage.css';

export default function AdminPage() {
  return (
    <div className="page admin-page">
      <h1>Configuracao</h1>
      <div className="admin-sections">
        <StationManager />
        <ItemTypeManager />
        <PrinterConfig />
      </div>
    </div>
  );
}
