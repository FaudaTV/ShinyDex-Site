// src/App.jsx
import { useState, useEffect } from 'react';
import ShinyList from './pages/ShinyList';

// Imports des données
import gensMetadata from './data/all.json';
import gen1 from './data/gen1.json';
import gen2 from './data/gen2.json';

// Fusion initiale des données pour la recherche globale
const allPokemonData = [...gen1, ...gen2];

function App() {
  // --- 1. ÉTATS (STATES) ---
  
  // IDs capturés avec récupération LocalStorage
  const [capturedIds, setCapturedIds] = useState(() => {
    const saved = localStorage.getItem('shiny-dex-captured');
    return saved ? JSON.parse(saved) : [];
  });

  // Filtres : Générations cochées et Recherche textuelle
  const [selectedGens, setSelectedGens] = useState(gensMetadata.map(m => m.gen));
  const [searchTerm, setSearchTerm] = useState("");

  // --- 2. SAUVEGARDE AUTOMATIQUE ---
  useEffect(() => {
    localStorage.setItem('shiny-dex-captured', JSON.stringify(capturedIds));
  }, [capturedIds]);

  // --- 3. CALCULS DYNAMIQUES (Calculés à chaque rendu) ---

  // Filtrage principal (Générations + Recherche Nom/ID)
  const displayedPokemons = allPokemonData.filter(p => {
    const meta = gensMetadata.find(m => p.id >= m.startId && p.id <= m.endId);
    const isGenSelected = selectedGens.includes(meta?.gen);
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toString().includes(searchTerm) ||
      p.types.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return isGenSelected && matchesSearch;
  });

  // Statistiques pour la barre de progression (basées sur la sélection)
  const totalAffiche = gensMetadata
    .filter(meta => selectedGens.includes(meta.gen))
    .reduce((acc, curr) => acc + curr.count, 0);

  const capturesAffichees = capturedIds.filter(id => {
    return gensMetadata.some(meta => 
      selectedGens.includes(meta.gen) && id >= meta.startId && id <= meta.endId
    );
  }).length;

  const progressAffichee = totalAffiche > 0 ? (capturesAffichees / totalAffiche) * 100 : 0;

  // --- 4. FONCTIONS LOGIQUES ---

  const toggleCapture = (id) => {
    setCapturedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleGen = (genId) => {
    setSelectedGens(prev => {
      if (prev.includes(genId)) {
        // Si on décoche et que c'est la dernière, on laisse un tableau vide
        return prev.filter(id => id !== genId);
      } else {
        // Sinon on ajoute
        return [...prev, genId];
      }
    });
  };

  const toggleAllGens = () => {
    // Si tout est déjà coché, on vide tout
    if (selectedGens.length === gensMetadata.length) {
      setSelectedGens([]);
    } else {
      // Sinon, on coche tout ce qui existe dans metadata
      const allIds = gensMetadata.map(m => m.gen);
      setSelectedGens(allIds);
    }
  };

  // --- 5. RENDU (JSX) ---
  return (
    <div className="min-vh-100 bg-light">
      {/* NAVBAR STICKY */}
      <nav className="navbar navbar-dark bg-dark sticky-top py-3 shadow">
        <div className="container d-flex flex-column gap-3">
          
          {/* LIGNE 1 : LOGO + COMPTEUR + DROPDOWN */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <span className="navbar-brand fw-bold fs-3 m-0">✨ SHINYDEX</span>
            
            <div className="d-flex align-items-center gap-3">             
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-warning dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">
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

          {/* LIGNE 2 : BARRE DE RECHERCHE */}
          <div className="w-100">
            <div className="input-group">
              <span className="input-group-text bg-warning border-warning text-dark">🔍</span>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary shadow-none" 
                placeholder="Chercher par nom ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchTerm("")}>✕</button>
              )}
            </div>
          </div>

          {/* LIGNE 3 : PROGRESSION + COMPTEUR À DROITE */}
          <div className="d-flex align-items-center gap-3 w-100">
            
            {/* La barre prend tout l'espace disponible (flex-grow-1) */}
            <div className="progress flex-grow-1" style={{ height: '12px', backgroundColor: '#333' }}>
              <div 
                className="progress-bar bg-warning progress-bar-striped progress-bar-animated" 
                style={{ width: `${progressAffichee}%`, transition: 'width 0.5s ease-in-out' }}
              ></div>
            </div>

            {/* Le compteur calé à droite avec une largeur fixe pour la stabilité */}
            <div className="text-end" style={{ minWidth: '100px' }}>
              <span className="text-warning fw-bold fs-4">{capturesAffichees}</span>
              <span className="text-white-50 fs-6"> / {totalAffiche}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold m-0">Pokédex</h2>
          <span className="badge bg-dark px-3 py-2">{displayedPokemons.length} Pokémon trouvés</span>
        </div>

        {/* Message si aucun résultat */}
        {displayedPokemons.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted fs-4">Aucun Pokémon ne correspond à votre recherche.</p>
          </div>
        ) : (
          <ShinyList 
            pokemons={displayedPokemons} 
            capturedIds={capturedIds} 
            onToggle={toggleCapture} 
          />
        )}
      </div>
    </div>
  );
}

export default App;