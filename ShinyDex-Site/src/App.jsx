// src/App.jsx
import { useState, useEffect } from 'react';
import ShinyList from './pages/ShinyList';
import Navbar from './components/Navbar';

import gensMetadata from './data/all.json';
import gen1 from './data/gen1.json';
import gen2 from './data/gen2.json';
import gen3 from './data/gen3.json';
import gen4 from './data/gen4.json';

const allPokemonData = [...gen1, ...gen2, ...gen3, ...gen4];

function App() {
  // --- ÉTATS ---
  const [capturedIds, setCapturedIds] = useState(() => {
    const saved = localStorage.getItem('shiny-dex-captured');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedGens, setSelectedGens] = useState(gensMetadata.map(m => m.gen));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // --- SAUVEGARDE ---
  useEffect(() => {
    localStorage.setItem('shiny-dex-captured', JSON.stringify(capturedIds));
  }, [capturedIds]);

  // --- FONCTIONS LOGIQUES (Celles qui manquaient) ---
  const toggleCapture = (id) => {
    setCapturedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleGen = (genId) => {
    const id = Number(genId); // On force le type Number
    setSelectedGens(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllGens = () => {
    if (selectedGens.length === gensMetadata.length) {
      setSelectedGens([]);
    } else {
      setSelectedGens(gensMetadata.map(m => Number(m.gen))); // On force le type Number
    }
  };

  // --- FILTRAGE ---
  const displayedPokemons = allPokemonData.filter(p => {
    // On force la conversion en Number pour éviter les bugs de comparaison "1" vs 1
    const pId = Number(p.id);

    // 1. Trouver la génération (avec conversion forcée)
    const meta = gensMetadata.find(m => 
      pId >= Number(m.startId) && pId <= Number(m.endId)
    );
    
    // Si on ne trouve pas de meta, on n'affiche pas (évite le plantage)
    if (!meta) return false;

    // 2. Vérifier si la génération est sélectionnée
    const isGenSelected = selectedGens.includes(Number(meta.gen));

    // 3. Recherche (Nom, ID ou Type)
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pId.toString().includes(searchTerm) ||
      (p.types && p.types.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    // 4. Statut (Obtenu / Manquant)
    const isCaptured = capturedIds.includes(pId);
    let matchesStatus = true;
    if (statusFilter === "captured") matchesStatus = isCaptured;
    if (statusFilter === "missing") matchesStatus = !isCaptured;

    return isGenSelected && matchesSearch && matchesStatus;
  });

  // --- STATS ---
  const totalAffiche = gensMetadata
    .filter(m => selectedGens.includes(m.gen))
    .reduce((acc, c) => acc + c.count, 0);

  const capturesAffichees = capturedIds.filter(id => 
    gensMetadata.some(m => selectedGens.includes(m.gen) && id >= m.startId && id <= m.endId)
  ).length;

  const progress = totalAffiche > 0 ? (capturesAffichees / totalAffiche) * 100 : 0;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter}
        selectedGens={selectedGens}
        toggleGen={toggleGen}
        toggleAllGens={toggleAllGens}
        progress={progress} 
        current={capturesAffichees} 
        total={totalAffiche}
      />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold m-0">Pokédex</h2>
          <span className="badge bg-dark px-3 py-2">
            {displayedPokemons.length} Pokémon trouvés
          </span>
        </div>

        {displayedPokemons.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted fs-4">Aucun résultat...</p>
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