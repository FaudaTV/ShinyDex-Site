import PokemonCard from '../components/PokemonCard';

export default function ShinyList({ pokemons, capturedIds, onToggle }) {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
      {pokemons.map(p => (
        <PokemonCard 
          key={p.id} 
          pokemon={p} 
          isCaptured={capturedIds.includes(p.id)} 
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}