import { useState , useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPokemon } from './PokemonApi';

const Battle = () => {
  const { pokemon1 , pokemon2 } = useParams();
  const [pokemon1Data , setPokemon1Data] = useState(null);
  const [pokemon2Data , setPokemon2Data] = useState(null);
  const [battleLog , setBattleLog] = useState([]);
  const [currentTurn , setCurrentTurn] = useState(1);
  const [gameOver , setGameOver] = useState(false);
  const [winner , setWinner] = useState(null);
  const [loading , setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {

        setLoading(true);
        const p1Data = await getPokemon(pokemon1);
        const p2Data = await getPokemon(pokemon2);
        
        const loadedP1 = loadPokemonData(p1Data);
        const loadedP2 = loadPokemonData(p2Data);
        
        setPokemon1Data(loadedP1);
        setPokemon2Data(loadedP2);

        setBattleLog([`Battle Between ${loadedP1.name} and ${loadedP2.name} Begins!`]);

      } catch (error) {
        console.error("Error getting Pokémon Data:", error);
        setBattleLog(["Error: Could not load Pokémon Data. Please try Again."]);
      } finally {
        setLoading(false);
      }

    };
    
    fetchPokemonData();
  } , [pokemon1 , pokemon2]);


  const loadPokemonData = (pokemonData) => {

    return {
      id: pokemonData.id ,
      name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1) ,
      hp: pokemonData.stats.find(stat => stat.stat.name === "hp").base_stat ,
      currentHp: pokemonData.stats.find(stat => stat.stat.name === "hp").base_stat ,
      attack: pokemonData.stats.find(stat => stat.stat.name === "attack").base_stat ,
      defense: pokemonData.stats.find(stat => stat.stat.name === "defense").base_stat, 
      speed: pokemonData.stats.find(stat => stat.stat.name === "speed").base_stat ,
      sprite: pokemonData.sprites.front_default ,
      backSprite: pokemonData.sprites.back_default ,
      moves: pokemonData.moves.slice(0, 4).map(moveData => ({
        name: moveData.move.name.replace("-" , " ") ,
        url: moveData.move.url
      }))
    };
  };

  const handleMoveSelect = async(moveIndex) => {
    if(gameOver) return;
    
    const attacker = currentTurn === 1 ? pokemon1Data : pokemon2Data;
    const defender = currentTurn === 1 ? pokemon2Data : pokemon1Data;
    const move = attacker.moves[moveIndex];
    
    const damage = Math.floor(attacker.attack / 5) + Math.floor(Math.random() * 10);
    const newHp = Math.max(0 , defender.defense > attacker.attack ? defender.currentHp - 1 : defender.currentHp - damage);
    
    if (currentTurn === 1) {
      setPokemon2Data({
        ...pokemon2Data ,
        currentHp: newHp
      });

    } else {
      setPokemon1Data({
        ...pokemon1Data ,
        currentHp: newHp
      });
    }
    
    setBattleLog(prevLog => [
      ...prevLog,
      `${attacker.name} used ${move.name}!` ,
      `${defender.name} took ${damage} damage!`
    ]);
    
    if (newHp <= 0) {
      setBattleLog(prevLog => [
        ...prevLog,
        `${defender.name} fainted!` ,
        `${attacker.name} wins the battle!`
      ]);
      setGameOver(true);
      setWinner(attacker.name);
      return;
    }
    
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
  };

  const resetBattle = async() => {
    try {

      setLoading(true);
      const p1Data = await getPokemon(pokemon1);
      const p2Data = await getPokemon(pokemon2);
      
      const loadedP1 = loadPokemonData(p1Data);
      const loadedP2 = loadPokemonData(p2Data);
      
      setPokemon1Data(loadedP1);
      setPokemon2Data(loadedP2);
      setBattleLog([`Battle between ${loadedP1.name} and ${loadedP2.name} begins!`]);
      setCurrentTurn(1);
      setGameOver(false);
      setWinner(null);

    } catch (error) {
      console.error("Error resetting battle:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="loading"> Loading battle data... </div>;
  }

  if (!pokemon1Data || !pokemon2Data) {
    return <div className="error"> Error loading Pokémon data. Please try again. </div>;
  }

  return (

    <div className="battleContainer">
      <h1>Pokémon Battle</h1>
      
      <div className="battleArena">
        <div className="pokemon pokemon-1">
          <h2>{pokemon1Data.name}</h2>
          <img src={currentTurn === 1 ? pokemon1Data.backSprite : pokemon1Data.sprite} alt={pokemon1Data.name} />
          <div className="hBar">
            <div className="hpFill" style={{ 

              width: `${(pokemon1Data.currentHp / pokemon1Data.hp) * 100}%`  ,
              backgroundColor: pokemon1Data.currentHp < pokemon1Data.hp / 3 ? "red" : 
                              pokemon1Data.currentHp < pokemon1Data.hp / 2 ? "orange" : "green"
            }}></div>
          </div>
          <p>HP: {pokemon1Data.currentHp} / {pokemon1Data.hp}</p>
        </div>
        
        <div className="pokemon pokemon-2">
          <h2>{pokemon2Data.name}</h2>
          <img src={currentTurn === 2 ? pokemon2Data.backSprite : pokemon2Data.sprite} alt={pokemon2Data.name} />
          <div className="hpBar">
            <div className="hpFill" style={{ 

              width: `${(pokemon2Data.currentHp / pokemon2Data.hp) * 100}%` ,
              backgroundColor: pokemon2Data.currentHp < pokemon2Data.hp / 3 ? "red" : 
                              pokemon2Data.currentHp < pokemon2Data.hp / 2 ? "orange" : "green"
            }}></div>
          </div>
          <p>HP: {pokemon2Data.currentHp} / {pokemon2Data.hp}</p>
        </div>
      </div>
      
      {!gameOver ? (

        <div className="battleControls">
          <h3>{currentTurn === 1 ? pokemon1Data.name : pokemon2Data.name}'s turn</h3>
          <div className="movesContainer">
            {(currentTurn === 1 ? pokemon1Data : pokemon2Data).moves.map((move , index) => (
              <button 
                key = {index} 
                onClick={() => handleMoveSelect(index)}
                className="moveButton"
              >
                {move.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="battleResult">
          <h3>{winner} wins!</h3>
          <button onClick={resetBattle} className="resetButton"> Battle Again </button>
        </div>
      )}
      
      <div className="battleLog">
        <h3>Battle Log</h3>
        <div className="logEntries">
          {battleLog.map((entry , index) => (
            <p key={index}>{entry}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Battle;
