// src/App.jsx
import { useState, useEffect } from 'react';
import ShinyList from './pages/ShinyList';
import Navbar from './components/Navbar';

import gensMetadata from './data/all.json';
import gen1 from './data/gen1.json';
import gen2 from './data/gen2.json';
import gen3 from './data/gen3.json';
import gen4 from './data/gen4.json';
import gen5 from './data/gen5.json';
import gen6 from './data/gen6.json';
import gen7 from './data/gen7.json';

const allPokemonData = [...gen1, ...gen2, ...gen3, ...gen4, ...gen5, ...gen6, ...gen7];

function App() {
  // --- ÉTATS ---
  const [capturedIds, setCapturedIds] = useState(() => {
    const saved = localStorage.getItem('shiny-dex-captured');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedGens, setSelectedGens] = useState(gensMetadata.map(m => m.gen));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // --- MODIF : LIMITE POUR INFINITE SCROLL ---
  const [limit, setLimit] = useState(40); // On commence par afficher 40 Pokémon

  // --- SAUVEGARDE ---
  useEffect(() => {
    localStorage.setItem('shiny-dex-captured', JSON.stringify(capturedIds));
  }, [capturedIds]);

  // --- MODIF : LOGIQUE DE SCROLL INFINI ---
  useEffect(() => {
    const handleScroll = () => {
      // Si on arrive à 300px du bas de la page, on charge les 40 suivants
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setLimit(prev => prev + 40);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- MODIF : RESET LA LIMITE QUAND ON FILTRE ---
  useEffect(() => {
    setLimit(40); // On remonte en haut de liste si on cherche un Pokémon précis
  }, [searchTerm, selectedGens, statusFilter]);

  // --- FONCTIONS LOGIQUES ---
  const toggleCapture = (id) => {
    setCapturedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleGen = (genId) => {
    const id = Number(genId);
    setSelectedGens(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllGens = () => {
    if (selectedGens.length === gensMetadata.length) {
      setSelectedGens([]);
    } else {
      setSelectedGens(gensMetadata.map(m => Number(m.gen)));
    }
  };

  // --- FILTRAGE ---
  const filteredPokemons = allPokemonData.filter(p => {
    const pId = Number(p.id);
    const meta = gensMetadata.find(m => pId >= Number(m.startId) && pId <= Number(m.endId));
    
    if (!meta) return false;

    const isGenSelected = selectedGens.includes(Number(meta.gen));

    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pId.toString().includes(searchTerm) ||
      (p.types && p.types.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const isCaptured = capturedIds.includes(pId);
    let matchesStatus = true;
    if (statusFilter === "captured") matchesStatus = isCaptured;
    if (statusFilter === "missing") matchesStatus = !isCaptured;

    return isGenSelected && matchesSearch && matchesStatus;
  });

  // --- MODIF : DÉCOUPE DU TABLEAU POUR L'AFFICHAGE ---
  const displayedPokemons = filteredPokemons.slice(0, limit);

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
            {filteredPokemons.length} Pokémon trouvés
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