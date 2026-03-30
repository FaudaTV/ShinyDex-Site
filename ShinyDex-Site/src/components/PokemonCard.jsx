export default function PokemonCard({ pokemon, isCaptured, onToggle }) {
  
  // On définit manuellement le préfixe pour GitHub Pages
  const repoName = 'ShinyDex-Site';
  // On vérifie si on est en production (sur GitHub) ou en local
  const isProduction = import.meta.env.PROD;

  // On construit le chemin : si prod, on ajoute le nom du repo, sinon rien
  const base = isProduction ? `/${repoName}/` : '/';

  // On nettoie le chemin du JSON (enlève le premier slash s'il existe)
  const cleanImgPath = pokemon.img.startsWith('/') ? pokemon.img.slice(1) : pokemon.img;

  const finalSrc = `${base}${cleanImgPath}`;

  return (
    <div className="col">
      <div 
        className={`card h-100 card-pokemon ${isCaptured ? 'is-captured' : 'not-captured'}`}
        onClick={() => onToggle(pokemon.id)}
      >
        {/* Header avec l'ID stylisé */}
        <div className="p-3 d-flex justify-content-between align-items-center position-relative">
        <span className={`badge ${isCaptured ? 'bg-dark' : 'bg-secondary opacity-50'} rounded-pill`}>
            #{pokemon.id.toString().padStart(4, '0')}
        </span>
        
        {/* On fixe la place de l'étoile avec "position-absolute" */}
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

        {/* Sprite avec effet grayscale */}
        <div className="text-center py-2">
          <img 
            src={finalSrc} 
            alt={pokemon.name} 
            className="img-fluid"
            style={{ 
              height: '110px', 
              filter: isCaptured ? 'drop-shadow(0 5px 10px rgba(0,0,0,0.1))' : 'grayscale(100%) opacity(0.4)',
              transition: 'all 0.4s ease'
            }} 
          />
        </div>

        <div className="card-body text-center">
          {/* Nom du Pokemon avec un peu d'espace */}
          <h5 className={`fw-black text-capitalize mb-3 ${isCaptured ? 'text-dark' : 'text-muted'}`}>
            {pokemon.name}
          </h5>
          
          {/* Types stylisés */}
          <div className="d-flex justify-content-center gap-2">
            {pokemon.types?.map(type => (
              <span 
                key={type} 
                className={`badge-type ${type.toLowerCase()} ${!isCaptured && 'grayscale-badge'}`}
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