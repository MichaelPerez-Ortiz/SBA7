import { useState , useEffect , useRef} from 'react';
import { useParams , Link } from 'react-router-dom';
import { getPokemon , getMoveDetails , getAttackMoves } from './PokemonApi';

const Battle = () => {
  const { pokemon1 , pokemon2 , moves1 , moves2 } = useParams();
  const [pokemon1Data , setPokemon1Data] = useState(null);
  const [pokemon2Data , setPokemon2Data] = useState(null);
  const [battleLog , setBattleLog] = useState([]);
  const [currentTurn , setCurrentTurn] = useState(1);
  const [gameOver , setGameOver] = useState(false);
  const [winner , setWinner] = useState(null);
  const [loading , setLoading] = useState(true);
  const [movesLoading , setMovesLoading] = useState(true);
  const [animation , setAnimation] = useState(null);

  const pokemon1Ref = useRef(null)
  const pokemon2Ref = useRef(null)
  const battleLogRef = useRef(null)


  useEffect(() => {
    const fetchPokemonData = async () => {
      try {

        setLoading(true);
        const p1Data = await getPokemon(pokemon1);
        const p2Data = await getPokemon(pokemon2);


        let loadedP1 , loadedP2;

        if(moves1 === "random") {
            const p1Moves = await getAttackMoves(p1Data , 4);
            loadedP1 = loadPokemonData(p1Data , p1Moves);

        } else {
            const moves1Id = moves1.split(",").map(Number);
            loadedP1 = await loadPokemonSelectedMoves(p1Data , moves1Id);
        }

           if(moves2 === "random") {
            const p2Moves = await getAttackMoves(p2Data , 4);
            loadedP2 = loadPokemonData(p2Data , p2Moves);

        } else {
            const moves2Id = moves2.split(",").map(Number);
            loadedP2 = await loadPokemonSelectedMoves(p2Data , moves2Id);
        }
        
        setPokemon1Data(loadedP1);
        setPokemon2Data(loadedP2);


        setBattleLog([`Battle Between ${loadedP1.name} and ${loadedP2.name} Begins!`]);
        setMovesLoading(false);
      } catch (error) {
        console.error("Error getting Pokémon Data:", error);
        setBattleLog(["Error: Could not load Pokémon Data. Please try Again."]);
      } finally {
        setLoading(false);
      }

    };
    
    fetchPokemonData();
  } , [pokemon1 , pokemon2 , moves1 , moves2]);

  useEffect(() => {
    if(battleLogRef.current) {
        battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  } , [battleLog]);


  const loadPokemonData = (pokemonData , moves) => {

    return {
      id: pokemonData.id ,
      name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1) ,
      level: 50 ,
      hp: pokemonData.stats.find(stat => stat.stat.name === "hp").base_stat ,
      currentHp: pokemonData.stats.find(stat => stat.stat.name === "hp").base_stat ,
      attack: pokemonData.stats.find(stat => stat.stat.name === "attack").base_stat ,
      defense: pokemonData.stats.find(stat => stat.stat.name === "defense").base_stat , 
      specialAttack: pokemonData.stats.find(stat => stat.stat.name === "special-attack").base_stat ,
      specialDefense: pokemonData.stats.find(stat => stat.stat.name === "special-defense").base_stat , 
      speed: pokemonData.stats.find(stat => stat.stat.name === "speed").base_stat ,
      sprite: pokemonData.sprites.front_default ,
      backSprite: pokemonData.sprites.back_default || pokemonData.sprites.front_default ,
      moves: moves ,
      types: pokemonData.types.map(type => type.type.name)
    };
  };


  const loadPokemonSelectedMoves = async (pokemonData , moveIds) => {
    const selectedMoves = [];

    if(moveIds && moveIds.length > 0) {
        for(let moveId of moveIds) {
    try {

            const moveDetails = await getMoveDetails(moveId);
            selectedMoves.push({
                id: moveDetails.id ,
                name: moveDetails.name.replace("-" , "") ,
                power: moveDetails.power || 40 ,
                accuracy: moveDetails.accuracy || 100 ,
                type: moveDetails.type.name ,
                category: moveDetails.damage_class?.name || "physical"
            });
    } catch (error) {
        console.error(`Error fetching Move Details for Move ID ${moveId}:` , error);
         }
      }
    }

    if(selectedMoves.length === 0) {
        const randomMoves = await getAttackMoves(pokemonData , 4);
        selectedMoves.push(...randomMoves);
    }
    return loadPokemonData(pokemonData , selectedMoves);
  };

  const calculateDamage = (attacker , defender ,move) => {
    const attackStat = move.category === "special" ? attacker.specialAttack : attacker.attack;
    const defenseStat = move.category === "special" ? defender.specialDefense : defender.defense;

    let damage = Math.floor((2 * attacker.level /5 + 2) * move.power * attackStat / defenseStat / 50 + 2);
  
    const randomDmg = (Math.random() * 16 + 85) / 100;
    damage = Math.floor(damage * randomDmg);

    const typeMultiplier = 1.0;
    damage = Math.floor(damage * typeMultiplier)//Implement later

    return Math.max(1 , damage);

};


//Combat

  const handleMoveSelect = async(moveIndex) => {
    if(gameOver || animation) return;
    
    const attacker = currentTurn === 1 ? pokemon1Data : pokemon2Data;
    const defender = currentTurn === 1 ? pokemon2Data : pokemon1Data;
    const move = attacker.moves[moveIndex];

    const accuracyCheck = Math.random() * 100;

    if(accuracyCheck > move.accuracy) {
        setBattleLog([`${attacker.name} used ${move.name}!` , `But it missed!`]);
        setCurrentTurn(currentTurn === 1 ? 2 : 1);
        return;
    }
    
    const damage = calculateDamage(attacker , defender , move);
    const newHp = Math.max(0 , defender.currentHp - damage);

    setAnimation({
        attacker: currentTurn ,
        move: move.name
    });

    setBattleLog([`${attacker.name} used ${move.name}!` , `${defender.name} took ${damage} damage!`]);

    setTimeout(() => {
    
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

    setAnimation(null);

    if (newHp <= 0) {
        setAnimation({
            fainted: currentTurn === 1? 2 : 1
        });
      setBattleLog([`${defender.name} fainted!` , `${attacker.name} wins the battle!`]);
    
     setTimeout(() => {
      setGameOver(true);
      setWinner(attacker.name);
      setAnimation(null);
      return;
    } , 1500);

    return;
}
    
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
  } , 1500);
};



  const resetBattle = async() => {
    try {

      setLoading(true);
      const p1Data = await getPokemon(pokemon1);
      const p2Data = await getPokemon(pokemon2);
      
      let loadedP1 , loadedP2;

      if(moves1 === "random") {
        const p1Moves = await getAttackMoves(p1Data , 4);
        loadedP1 = loadPokemonData(p1Data , p1Moves);
      } else {
        const moves1Id = moves1.split(",").map(Number);
        loadedP1 = await loadPokemonSelectedMoves(p1Data , moves1Id);
      }
      
      if(moves2 === "random") {
        const p2Moves = await getAttackMoves(p2Data , 4);
        loadedP2 = loadPokemonData(p2Data , p2Moves);
      } else {
        const moves2Id = moves2.split(",").map(Number);
        loadedP2 = await loadPokemonSelectedMoves(p2Data , moves2Id);
      }
      
      setPokemon1Data(loadedP1);
      setPokemon2Data(loadedP2);
      setBattleLog([`Battle between ${loadedP1.name} and ${loadedP2.name} begins!`]);
      setCurrentTurn(1);
      setGameOver(false);
      setWinner(null);
      setMovesLoading(false);

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
        
     <div className="battleArena">

      <div className = "versus"> VS </div>

      <div className = "battleLog">
        <div className="logEntries" ref = {battleLogRef}>
          {battleLog.map((entry , index) => (
            <p key = {index}> {entry}</p>
          ))}
        </div>
      </div>
      
      
        <div className = {`pokemon pokemon-1 ${animation?.attacker === 1 ? "attacking" : animation?.attacker === 2 ? "taking-damage" : ""} ${animation?.fainted === 1 ? "fainted" : ""}`} ref = {pokemon1Ref}>
          <h2>{pokemon1Data.name}</h2>
         <div className = "pokemonImageContainer">
          <img src = {pokemon1Data.backSprite} alt = {pokemon1Data.name} className={animation?.attacker === 2 ? "damage-flash" : ""}/>

           {animation?.attacker === 2 && <div className="attack-effect"></div>}
           {animation?.attacker === 1 && <div className="attack-origin"></div>}
         </div>

         <div className = "pokemonInfo">
          <div className="hpBar">
            <div className="hpFill" style={{ 

              width: `${(pokemon1Data.currentHp / pokemon1Data.hp) * 100}%`  ,
              backgroundColor: pokemon1Data.currentHp < pokemon1Data.hp / 3 ? "red" : 
                              pokemon1Data.currentHp < pokemon1Data.hp / 2 ? "orange" : "green"
            }}></div>
          </div>
          <p>HP: {pokemon1Data.currentHp} / {pokemon1Data.hp}</p>

          <div className = "pokemonTypes">
            {pokemon1Data.types.map((type , index) => (
                <span key = {index} className = {`typeBadge ${type}`}>{type}</span>
            ))}
        </div>
    </div>
 </div>

        <div className = {`pokemon pokemon-2 ${animation?.attacker === 2 ? "attacking" : animation?.attacker === 1 ? "taking-damage" : ""} ${animation?.fainted === 2 ? "fainted" : ""}`} ref = {pokemon2Ref}>
          <h2>{pokemon2Data.name}</h2>
         <div className = "pokemonImageContainer">
          <img src = {pokemon2Data.sprite} alt = {pokemon2Data.name} className={animation?.attacker === 1 ? "damage-flash" : ""}/>

           {animation?.attacker === 1 && <div className="attack-effect"></div>}
           {animation?.attacker === 2 && <div className="attack-origin"></div>}
         </div>

         <div className = "pokemonInfo">
          <div className="hpBar">
            <div className="hpFill" style={{ 

              width: `${(pokemon2Data.currentHp / pokemon2Data.hp) * 100}%`  ,
              backgroundColor: pokemon2Data.currentHp < pokemon2Data.hp / 3 ? "red" : 
                              pokemon2Data.currentHp < pokemon2Data.hp / 2 ? "orange" : "green"
            }}></div>
          </div>
          <p>HP: {pokemon2Data.currentHp} / {pokemon2Data.hp}</p>

          <div className = "pokemonTypes">
            {pokemon2Data.types.map((type , index) => (
                <span key = {index} className = {`typeBadge ${type}`}>{type}</span>
            ))}
            </div>
        </div>
    </div>
 </div>
        
      
      {!gameOver ? (

        <div className="battleControls">
          <h3>{currentTurn === 1 ? pokemon1Data.name : pokemon2Data.name}'s turn</h3>
          {movesLoading ? (
            <p> Loading moves...</p> 
          ) : (
          <div className="movesContainer">
            {(currentTurn === 1 ? pokemon1Data : pokemon2Data).moves.map((move , index) => (
              <button 
                key = {index} 
                onClick={() => handleMoveSelect(index)}
                className = {`moveButton ${move.type}`}
                disabled = {!!animation}
              >
               <span className = "moveName"> {move.name} </span>
               <span className = "moveType"> {move.type} </span>
               <span className = "movePower"> {move.power} </span>
              </button>
            ))}
          </div>
          )}
        </div>
      ) : (
        <div className = "battleResult">
          <h3>{winner === pokemon1Data.name? "You win!" : `${winner} wins!`}</h3>
          <div className = "resultButtons">
            <button onClick = {resetBattle} className = "resetButton"> Battle Again </button>
             <Link to = "/" className = "homeButton"> Back to Selection </Link>
          </div>
        </div>
      )}     
    </div>
  );
};

export default Battle;
