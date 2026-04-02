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
import gen8 from './data/gen8.json';
import gen9 from './data/gen9.json';
import formsData from './data/formes.json';
import femalData from './data/femelles.json';

const allPokemonData = [...gen1, ...gen2, ...gen3, ...gen4, ...gen5, ...gen6, ...gen7, ...gen8, ...gen9, ...formsData, ...femalData];

function App() {
  // --- ÉTATS ---
  const [capturedIds, setCapturedIds] = useState(() => {
    const saved = localStorage.getItem('shiny-dex-captured');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedGens, setSelectedGens] = useState(gensMetadata.map(m => m.gen));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFemales, setShowFemales] = useState(false);

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
    const pIdStr = String(p.id);
    const baseId = parseInt(pIdStr.split("-")[0]);
    
    // On identifie si c'est une femelle (ID finit par -f) ou une forme (ID avec un autre tiret)
    const isFemale = pIdStr.endsWith("-f");
    const isForm = pIdStr.includes("-") && !isFemale;

    // 1. Trouver la génération parente (Gen 1 à 9)
    const metaBase = gensMetadata.find(m => 
      baseId >= m.startId && 
      baseId <= m.endId && 
      m.gen !== 10
    );

    if (!metaBase) return false;

    // 2. LOGIQUE DE SÉLECTION
    const isParentGenSelected = selectedGens.includes(Number(metaBase.gen));
    const isFormsEnabled = selectedGens.includes(10);
    const onlyFormsSelected = selectedGens.length === 1 && isFormsEnabled;

    // --- NOUVELLE LOGIQUE COMBINÉE ---
    if (isFemale) {
      // On affiche la femelle SEULEMENT si sa Gen parente est cochée ET que le filtre femelle est ON
      // (Les femelles ne s'affichent pas si on ne coche QUE "Formes")
      if (!isParentGenSelected || !showFemales) return false;
    } 
    else if (isForm) {
      // Logique existante pour les formes (Gen 10)
      if (!isFormsEnabled || (!isParentGenSelected && !onlyFormsSelected)) {
        return false;
      }
    } 
    else {
      // Pokémon de base : doit avoir sa Gen cochée
      if (!isParentGenSelected) return false;
    }

    // 3. RECHERCHE (Inchangé)
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pIdStr.includes(searchTerm) ||
      (p.types && p.types.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    // 4. STATUT (Inchangé)
    const isCaptured = capturedIds.includes(p.id);
    let matchesStatus = true;
    if (statusFilter === "captured") matchesStatus = isCaptured;
    if (statusFilter === "missing") matchesStatus = !isCaptured;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    // --- TRI (Inchangé, il placera 0003-f après 0003) ---
    const partsA = String(a.id).split("-");
    const partsB = String(b.id).split("-");
    const numA = parseInt(partsA[0]);
    const numB = parseInt(partsB[0]);

    if (numA !== numB) return numA - numB;

    const variantA = partsA[1] || "";
    const variantB = partsB[1] || "";
    return variantA.localeCompare(variantB);
  });

  // --- MODIF : DÉCOUPE DU TABLEAU POUR L'AFFICHAGE ---
  const displayedPokemons = filteredPokemons.slice(0, limit);

  // --- STATS ---
  
  // Total des Pokémon de base uniquement (Gen 1 à 9)
  const totalAffiche = gensMetadata
    .filter(m => selectedGens.includes(m.gen) && m.gen !== 10)
    .reduce((acc, c) => acc + c.count, 0);

  // Nombre de captures parmi les Pokémon de base uniquement
  const capturesAffichees = capturedIds.filter(id => {
    const idStr = String(id);
    if (idStr.includes("-")) return false; // On ne compte pas les formes dans la progression

    const numId = parseInt(idStr);
    return gensMetadata.some(m => 
      selectedGens.includes(m.gen) && m.gen !== 10 && numId >= m.startId && numId <= m.endId
    );
  }).length;

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
        showFemales={showFemales}
        setShowFemales={setShowFemales}
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