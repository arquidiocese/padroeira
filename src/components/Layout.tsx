import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="app-layout">
      <nav className="app-nav">
        <div className="nav-brand">Nossa Senhora Aparecida</div>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              Operador
            </NavLink>
          </li>
          <li>
            <NavLink to="/panel">
              Painel TV
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin">
              Configuracao
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
