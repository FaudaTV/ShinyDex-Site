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

const baseData = [...gen1, ...gen2, ...gen3, ...gen4, ...gen5, ...gen6, ...gen7, ...gen8, ...gen9, ...formsData];

// On génère dynamiquement les entrées femelles
const allPokemonData = [];

baseData.forEach(p => {
  allPokemonData.push(p); 
  
  if (p.hasFemale) {
    const padId = String(p.id).padStart(4, '0');
    allPokemonData.push({
      ...p,
      id: `${padId}-f`,
      // On garde l'ID femelle, mais on ajoute un flag pour le composant
      isFemaleVariant: true,
      femaleImg: `/sprites/shiny/${padId}-f.png` 
    });
  }
});

function App() {
  // --- ÉTATS ---
  const [capturedIds, setCapturedIds] = useState(() => {
    const saved = localStorage.getItem('shiny-dex-captured');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedGens, setSelectedGens] = useState(gensMetadata.map(m => m.gen));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFemales, setShowFemales] = useState(true);

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
    
    // 1. Identification
    const isFemale = p.isFemaleVariant;
    const isForm = pIdStr.includes("-") && !isFemale;

    // 2. Trouver la génération parente
    const metaBase = gensMetadata.find(m => 
      baseId >= m.startId && 
      baseId <= m.endId && 
      m.gen !== 10
    );

    if (!metaBase) return false;

    const isParentGenSelected = selectedGens.includes(Number(metaBase.gen));
    const isFormsEnabled = selectedGens.includes(10);
    const onlyFormsSelected = selectedGens.length === 1 && isFormsEnabled;

    // --- LOGIQUE DE SÉLECTION CORRIGÉE ---
    if (isFemale) {
      if (!showFemales) return false;
      
      // On détecte si c'est une femelle d'une forme (ID contient déjà un tiret avant le -f final)
      // Ou si l'objet provient de formsData (on peut checker une propriété si tu en as une)
      const isFromForm = pIdStr.split('-').length > 2 || (pIdStr.includes('-') && !pIdStr.endsWith('-f'));
      
      if (isFromForm) {
        // Femelle d'une forme (ex: Rattata Alola ♀)
        if (!isFormsEnabled) return false;
      } else {
        // Femelle de base (ex: Florizarre ♀)
        if (!isParentGenSelected) return false;
      }
    } 
    else if (isForm) {
      if (!isFormsEnabled || (!isParentGenSelected && !onlyFormsSelected)) return false;
    } 
    else {
      if (!isParentGenSelected) return false;
    }

    // 3. RECHERCHE & STATUT
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pIdStr.includes(searchTerm) ||
      (p.types && p.types.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const isCaptured = capturedIds.includes(p.id);
    let matchesStatus = true;
    if (statusFilter === "captured") matchesStatus = isCaptured;
    if (statusFilter === "missing") matchesStatus = !isCaptured;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    const partsA = String(a.id).split("-");
    const partsB = String(b.id).split("-");
    const numA = parseInt(partsA[0]);
    const numB = parseInt(partsB[0]);

    if (numA !== numB) return numA - numB;

    // Tri par longueur de chaîne pour que 0019-f1 passe avant 0019-f1-f
    const vA = partsA.slice(1).join("-");
    const vB = partsB.slice(1).join("-");
    
    return vA.localeCompare(vB, undefined, { numeric: true, sensitivity: 'base' });
  });

  // --- MODIF : DÉCOUPE DU TABLEAU POUR L'AFFICHAGE ---
  const displayedPokemons = filteredPokemons.slice(0, limit);

  // --- STATS ---

  // 1. Déterminer si on est en mode "Défi Formes" (Uniquement la Gen 10 cochée)
  const isOnlyForms = selectedGens.length === 1 && selectedGens.includes(10);

  // 2. Calcul du Total
  const totalAffiche = gensMetadata
    .filter(m => {
      if (isOnlyForms) return m.gen === 10; // Si QUE formes, total = nb de formes (ex: 181)
      return selectedGens.includes(Number(m.gen)) && m.gen !== 10; // Sinon total = 1025 (ou par gen)
    })
    .reduce((acc, c) => acc + c.count, 0);

  // 3. Calcul des Captures
  const capturesAffichees = gensMetadata
    .filter(m => {
      if (isOnlyForms) return m.gen === 10;
      return selectedGens.includes(Number(m.gen)) && m.gen !== 10;
    })
    .reduce((totalGen, gen) => {
      let completedInGen = 0;

      if (gen.gen === 10) {
        // --- MODE FORMES ---
        // On veut que "Rattata Alola Mâle" et "Rattata Alola Femelle" comptent pour 1
        // On récupère toutes les formes de base (celles qui ne sont pas des variantes femelles)
        const distinctForms = formsData.filter(f => !f.isFemaleVariant);
        
        distinctForms.forEach(form => {
          const formIdStr = String(form.id); // ex: "0019-f1"
          
          // On considère la forme capturée si on a l'ID exact OU l'ID avec le suffixe femelle
          const isCaptured = capturedIds.some(cId => {
            const cIdStr = String(cId);
            return cIdStr === formIdStr || cIdStr === `${formIdStr}-f`;
          });
          
          if (isCaptured) completedInGen++;
        });
      } else {
        // --- MODE NORMAL (Gens 1-9) ---
        // 1 espèce = 1 point (Mâle OU Femelle OU n'importe quelle Forme)
        for (let id = gen.startId; id <= gen.endId; id++) {
          const baseIdInt = id;
          const baseIdStr = String(id).padStart(4, '0');

          const isSpeciesCaptured = capturedIds.some(capturedId => {
            const cIdStr = String(capturedId);
            const capturedBasePart = cIdStr.split("-")[0];
            return capturedId === baseIdInt || capturedBasePart === baseIdStr;
          });

          if (isSpeciesCaptured) completedInGen++;
        }
      }
      return totalGen + completedInGen;
    }, 0);

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