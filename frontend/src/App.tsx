import { Outlet, Link } from 'react-router-dom';
import { Home, MapPin } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>MLS Price Predictor</h1>
          <nav className="nav">
            <Link to="/" className="nav-link">
              <Home size={20} />
              Dashboard
            </Link>
            <Link to="/listings" className="nav-link">
              <MapPin size={20} />
              Listings
            </Link>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
