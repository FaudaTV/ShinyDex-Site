import { useState, useEffect } from 'react';

export default function PokemonCard({ pokemon, isCaptured, onToggle }) {
  // --- LOGIQUE DE CHEMIN (GitHub Pages) ---
  const repoName = 'ShinyDex-Site';
  const isProduction = import.meta.env.PROD;
  const base = isProduction ? `/${repoName}/` : '/';

  // --- LOGIQUE D'IMAGE DYNAMIQUE ---
  // On définit la source initiale
  // Si c'est une variante femelle générée, on tente d'abord le chemin avec -f
  const getInitialSrc = () => {
    const path = pokemon.isFemaleVariant ? pokemon.femaleImg : pokemon.img;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${base}${cleanPath}`;
  };

  const [imgSrc, setImgSrc] = useState(getInitialSrc());

  // Si on change de pokemon (rare pour une même carte mais utile pour React)
  useEffect(() => {
    setImgSrc(getInitialSrc());
  }, [pokemon]);

  return (
    <div className="col">
      <div 
        className={`card h-100 card-pokemon ${isCaptured ? 'is-captured' : 'not-captured'}`}
        onClick={() => onToggle(pokemon.id)}
      >
        {/* Header avec l'ID stylisé */}
        <div className="p-3 d-flex justify-content-between align-items-center position-relative">
          <span className={`badge ${isCaptured ? 'bg-dark' : 'bg-secondary opacity-50'} rounded-pill`}>
              #{pokemon.id.toString().split('-')[0].padStart(4, '0')}
          </span>
          
          <span 
              className="position-absolute end-0 me-3" 
              style={{ 
                visibility: isCaptured ? 'visible' : 'hidden',
                opacity: isCaptured ? 1 : 0,
                transition: 'all 0.3s ease',
                fontSize: '1.2rem'
              }}
          >
              ✨
          </span>
        </div>

        {/* Sprite avec gestion d'erreur automatique */}
        <div className="text-center py-2">
          <img 
            src={imgSrc} 
            alt={pokemon.name} 
            loading="lazy"
            className="img-fluid"
            style={{ 
              height: '110px', 
              filter: isCaptured ? 'drop-shadow(0 5px 10px rgba(0,0,0,0.1))' : 'grayscale(100%) opacity(0.4)',
              transition: 'all 0.4s ease'
            }} 
            // MAGIE : Si l'image femelle n'existe pas, on charge l'image mâle
            onError={() => {
              if (pokemon.isFemaleVariant) {
                const fallbackPath = pokemon.img.startsWith('/') ? pokemon.img.slice(1) : pokemon.img;
                setImgSrc(`${base}${fallbackPath}`);
              }
            }}
          />
        </div>

        <div className="card-body text-center">
          {/* NOM DU POKEMON + LOGO GENRE */}
          <h5 className={`fw-black text-capitalize mb-3 ${isCaptured ? 'text-dark' : 'text-muted'}`}>
            {pokemon.name}
            
            {/* Cas 1 : Variante femelle générée */}
            {pokemon.isFemaleVariant && (
              <span 
                style={{ 
                  color: isCaptured ? '#f85888' : 'inherit', // Rose si capturé, sinon gris/hérité
                  marginLeft: '8px', 
                  fontSize: '1.1rem',
                  opacity: isCaptured ? 1 : 0.5,
                  transition: 'color 0.3s ease'
                }}
              >
                ♀
              </span>
            )}

            {/* Cas 2 : Pokémon de base qui possède une femelle (le mâle) */}
            {(!pokemon.isFemaleVariant && pokemon.hasFemale) && (
              <span 
                style={{ 
                  color: isCaptured ? '#0c55ff' : 'inherit', // Bleu si capturé, sinon gris/hérité
                  marginLeft: '8px', 
                  fontSize: '1.1rem',
                  opacity: isCaptured ? 1 : 0.5,
                  transition: 'color 0.3s ease'
                }}
              >
                ♂
              </span>
            )}
          </h5>
          
          <div className="d-flex justify-content-center gap-2">
            {pokemon.types?.map(type => (
              <span 
                key={type} 
                className={`badge-type ${type.toLowerCase()}`}
                style={{ filter: isCaptured ? 'none' : 'saturate(0) opacity(0.6)' }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}