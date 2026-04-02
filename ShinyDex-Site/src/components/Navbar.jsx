// src/components/Navbar.jsx
import StatBar from './StatBar';
import gensMetadata from '../data/all.json';

const Navbar = ({ 
  searchTerm, setSearchTerm, 
  statusFilter, setStatusFilter, 
  selectedGens, toggleGen, toggleAllGens,
  progress, current, total,
  showFemales, setShowFemales
}) => {
  return (
    <nav className="navbar navbar-dark bg-dark sticky-top py-3 shadow">
      <div className="container d-flex flex-column gap-3">
        
        {/* LIGNE 1 : LOGO & DROPDOWNS */}
        <div className="d-flex justify-content-between align-items-center w-100">
          <span className="navbar-brand fw-bold fs-3 m-0">✨ SHINYDEX</span>

          <div className="d-flex align-items-center gap-2">
            <div className="form-check form-switch text-white ms-3">
              <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                id="switchFemales"
                checked={showFemales}
                onChange={(e) => setShowFemales(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label className="form-check-label small fw-bold" htmlFor="switchFemales" style={{ cursor: 'pointer' }}>
                Femelles
              </label>
            </div>

            {/* DROPDOWN STATUT */}
            <div className="dropdown">
              <button className="btn btn-sm btn-outline-warning dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                {statusFilter === 'all' ? 'Tous' : statusFilter === 'captured' ? 'Obtenus' : 'Manquants'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                {['all', 'captured', 'missing'].map(status => (
                  <li key={status}>
                    <button 
                      className={`dropdown-item d-flex justify-content-between align-items-center ${statusFilter === status ? 'active bg-warning text-dark' : ''}`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === 'all' ? 'Tous' : status === 'captured' ? 'Obtenus' : 'Manquants'}
                      {statusFilter === status && <small>✓</small>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* DROPDOWN GÉNÉRATIONS */}
            <div className="dropdown">
              <button className="btn btn-sm btn-outline-warning dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                Gens ({selectedGens.length})
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow p-3" style={{ minWidth: '250px' }}>
                <li>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" id="allGens" 
                           checked={selectedGens.length === gensMetadata.length} onChange={toggleAllGens} />
                    <label className="form-check-label fw-bold" htmlFor="allGens">Toutes</label>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                {gensMetadata.map(meta => (
                  <li key={meta.gen} className="mb-1">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id={`gen${meta.gen}`}
                             checked={selectedGens.includes(meta.gen)} onChange={() => toggleGen(meta.gen)} />
                      <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`gen${meta.gen}`}>
                        {meta.label} <span className="badge bg-light text-dark border ms-2 small">{meta.count}</span>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* LIGNE 2 : RECHERCHE */}
        <div className="w-100">
          <div className="input-group">
            <span className="input-group-text bg-warning border-warning text-dark">🔍</span>
            <input 
              type="text" className="form-control bg-dark text-white border-secondary shadow-none" 
              placeholder="Chercher par nom ou numéro..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button className="btn btn-outline-secondary" onClick={() => setSearchTerm("")}>✕</button>}
          </div>
        </div>

        {/* LIGNE 3 : BARRE DE STATS (Intégrée !) */}
        <StatBar progress={progress} current={current} total={total} />

      </div>
    </nav>
  );
};

export default Navbar;