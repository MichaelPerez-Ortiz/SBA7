import { useState , useEffect } from 'react';
import { getPokemon } from './PokemonApi';
import { Link } from 'react-router-dom';

const PokemonSelector = () => {
  const [pokemon1 , setPokemon1] = useState("");
  const [pokemon2 , setPokemon2] = useState("");
  const [pokemonList , setPokemonList] = useState([]);

  useEffect(() => {
    const fetchPokemonList = async () => {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const data = await response.json();
      setPokemonList(data.results.map((pokemon) => pokemon.name));
    };
    fetchPokemonList();
  } , []);

  const handlePokemon1Change = (event) => {
    setPokemon1(event.target.value);
  };

  const handlePokemon2Change = (event) => {
    setPokemon2(event.target.value);
  };

  return (

    <div>

      <h1>Select Two Pokémon</h1>
      <select value={pokemon1} onChange={handlePokemon1Change}>
        <option value=""> Select Pokémon 1 </option>
        {pokemonList.map((pokemon) => (
          <option key={pokemon} value={pokemon}>
            {pokemon}
          </option>
        ))} 
      </select>

      <select value={pokemon2} onChange={handlePokemon2Change}>
        <option value=""> Select Pokémon 2</option>
        {pokemonList.map((pokemon) => (
          <option key={pokemon} value={pokemon}>
            {pokemon}
          </option>
        ))}
      </select>

      <button>
        <Link to={`/battle/${pokemon1}/${pokemon2}`}> Battle! </Link>
      </button> 

    </div>
  );
};

export default PokemonSelector;