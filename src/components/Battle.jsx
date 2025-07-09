import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPokemon } from './PokemonApi';

const Battle = () => {
  const { pokemon1 , pokemon2 } = useParams();
  const [pokemon1Data , setPokemon1Data] = useState(null);
  const [pokemon2Data , setPokemon2Data] = useState(null);
  const [battleResult , setBattleResult] = useState(null);

  useEffect(() => {
    const fetchPokemonData = async () => {
      const pokemon1Data = await getPokemon(pokemon1);
      const pokemon2Data = await getPokemon(pokemon2);
      setPokemon1Data(pokemon1Data);
      setPokemon2Data(pokemon2Data);
    };
        
        fetchPokemonData();

  }, [pokemon1, pokemon2]);

  const simulateBattle = () => {
   
    if (pokemon1Data.stats[1].base_stat > pokemon2Data.stats[1].base_stat) {
      setBattleResult(`${pokemon1} wins!`);
      
    } else if (pokemon2Data.stats[1].base_stat > pokemon1Data.stats[1].base_stat) {
      setBattleResult(`${pokemon2} wins!`);

    } else {
      setBattleResult("It\'s a tie!");
    }
  };

  return (
    <div>
      <h1>Battle!</h1>
      {pokemon1Data && pokemon2Data && (
        <div>
          <p>{pokemon1Data.name} (Attack: {pokemon1Data.stats[1].base_stat})</p>
          <p>{pokemon2Data.name} (Attack: {pokemon2Data.stats[1].base_stat})</p>
          <button onClick={simulateBattle}> Simulate Battle </button>
          {battleResult && <p>{battleResult}</p>}
        </div>
      )}
    </div>
  );
};

export default Battle;
