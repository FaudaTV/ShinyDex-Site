// src/App.jsx
import { useState, useEffect } from 'react';
import ShinyList from './pages/ShinyList';
import gensMetadata from './data/all.json';
import gen1 from './data/gen1.json';
import gen2 from './data/gen2.json';

// On fusionne tout de suite pour pouvoir filtrer facilement
const allPokemonData = [...gen1, ...gen2]; 

function App() {
  const [capturedIds, setCapturedIds] = useState(() => {
    const saved = localStorage.getItem('shiny-dex-captured');
    return saved ? JSON.parse(saved) : [];
  });

  // État pour savoir quelles générations sont cochées (ex: [1, 2])
  const [selectedGens, setSelectedGens] = useState([1, 2]); 

  // --- CALCULS ---
  const totalPokeTheorique = gensMetadata.reduce((acc, curr) => acc + curr.count, 0);
  const globalProgress = (capturedIds.length / totalPokeTheorique) * 100;

  // Filtrage des pokémons selon les cases cochées
  const displayedPokemons = allPokemonData.filter(p => {
    // On cherche à quelle gen appartient le pokemon (basé sur son ID et all.json)
    const meta = gensMetadata.find(m => p.id >= m.startId && p.id <= m.endId);
    return selectedGens.includes(meta?.gen);
  });

  // --- LOGIQUE DES FILTRES ---
  const toggleGen = (genId) => {
    setSelectedGens(prev => 
      prev.includes(genId) ? prev.filter(id => id !== genId) : [...prev, genId]
    );
  };

  const toggleAllGens = () => {
    if (selectedGens.length === gensMetadata.length) setSelectedGens([]);
    else setSelectedGens(gensMetadata.map(m => m.gen));
  };

  // 1. On calcule le total des Pokémon des générations SÉLECTIONNÉES
  const totalAffiche = gensMetadata
    .filter(meta => selectedGens.includes(meta.gen))
    .reduce((acc, curr) => acc + curr.count, 0);

  // 2. On calcule combien d'IDs capturés appartiennent aux générations SÉLECTIONNÉES
  const capturesAffichees = capturedIds.filter(id => {
    // On regarde si l'ID appartient à une des générations cochées
    return gensMetadata.some(meta => 
      selectedGens.includes(meta.gen) && id >= meta.startId && id <= meta.endId
    );
  }).length;

  // 3. Progression (on évite la division par zéro si rien n'est coché)
  const progressAffichee = totalAffiche > 0 ? (capturesAffichees / totalAffiche) * 100 : 0;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark sticky-top py-3">
        <div className="container">
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="navbar-brand fw-bold fs-3 m-0">✨ SHINYDEX</span>
              
              <div className="d-flex align-items-center gap-3">
                {/* COMPTEUR DYNAMIQUE */}
                <div className="text-end d-none d-sm-block">
                  <span className="text-warning fw-bold fs-4">{capturesAffichees}</span>
                  <span className="text-white-50 fs-6"> / {totalAffiche}</span>
                </div>
                
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-warning dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    Générations ({selectedGens.length})
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow p-3" style={{ minWidth: '250px' }}>
                  <li>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="allGens" 
                            checked={selectedGens.length === gensMetadata.length}
                            onChange={toggleAllGens} />
                      <label className="form-check-label fw-bold" htmlFor="allGens">Toutes les générations</label>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {gensMetadata.map(meta => (
                    <li key={meta.gen} className="mb-1">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id={`gen${meta.gen}`}
                              checked={selectedGens.includes(meta.gen)}
                              onChange={() => toggleGen(meta.gen)} />
                        <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`gen${meta.gen}`}>
                          {meta.label}
                          <span className="badge bg-light text-dark border ms-2 small">{meta.count}</span>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* BARRE DE PROGRESSION DYNAMIQUE */}
          <div className="progress mt-2" style={{ height: '8px', backgroundColor: '#333' }}>
            <div 
              className="progress-bar bg-warning progress-bar-striped progress-bar-animated" 
              style={{ width: `${progressAffichee}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
          </div>
        </div>
      </div>
    </nav>

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Pokédex</h2>
          <span className="text-muted">{displayedPokemons.length} Pokémon affichés</span>
        </div>

        <ShinyList 
          pokemons={displayedPokemons} 
          capturedIds={capturedIds} 
          onToggle={(id) => setCapturedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
          )} 
        />
      </div>
    </div>
  );
}

export default App;