import { useState , useEffect } from 'react';
import { getPokemon , getRandomPokemon } from './PokemonApi';
import { Link } from 'react-router-dom';

const PokemonSelector = () => {
  const [pokemon1 , setPokemon1] = useState("");
  const [pokemon2 , setPokemon2] = useState("");
  const [pokemonList , setPokemonList] = useState([]);
  const [loading , setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemonList = async () => {
      try { 

        setLoading(true);
        
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await response.json();
        
        setPokemonList(data.results.map((pokemon) => pokemon.name));

      } catch (error) {
        console.error("Error fetching Pokémon list:" , error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonList();
  } , []);

  const handlePokemon1Change = (event) => {
    setPokemon1(event.target.value);
  };

  const handlePokemon2Change = (event) => {
    setPokemon2(event.target.value);
  };

  const handleRandomSelection = async () => {
    try {
      setLoading(true);
      const randomPokemon1 = await getRandomPokemon();
      const randomPokemon2 = await getRandomPokemon();
      setPokemon1(randomPokemon1.name);
      setPokemon2(randomPokemon2.name);
    } catch (error) {
      console.error("Error selecting random Pokémon:", error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="pokemonSelector">
      <h1>Select Two Pokémon</h1>
      {loading ? (
        <p>Loading Pokémon...</p>
      ) : (
        <>
          <div className="selectionControls">
            <div className="selectContainer">
              <label htmlFor="pokemon1">First Pokémon:</label>
              <select id="pokemon1" value={pokemon1} onChange={handlePokemon1Change}>
                <option value=""> Select Pokémon 1 </option>
                {pokemonList.map((pokemon) => (
                  <option key={pokemon} value={pokemon}>
                    {pokemon.charAt(0).toUpperCase() + pokemon.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="selectContainer">
              <label htmlFor="pokemon2">Second Pokémon:</label>
              <select id="pokemon2" value={pokemon2} onChange={handlePokemon2Change}>
                <option value=""> Select Pokémon 2 </option>
                {pokemonList.map((pokemon) => (
                  <option key={pokemon} value={pokemon}>
                    {pokemon.charAt(0).toUpperCase() + pokemon.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="buttonContainer">
            <button onClick={handleRandomSelection}> Random Selection </button>
            <button disabled={!pokemon1 || !pokemon2}>
              <Link to={`/battle/${pokemon1}/${pokemon2}`} className={!pokemon1 || !pokemon2 ? "disabledLink" : ""}>
                Battle!
              </Link>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonSelector;
