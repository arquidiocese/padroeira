import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './providers/WebSocketProvider';
import Layout from './components/Layout';
import OperatorPage from './pages/OperatorPage';
import PanelPage from './pages/PanelPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter basename="/padroeira">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<OperatorPage />} />
            <Route path="/panel" element={<PanelPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}

export default App;
