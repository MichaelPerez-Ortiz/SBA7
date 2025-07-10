import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPokemon, getMoveDetails, getAttackMoves } from './PokemonApi';

const MoveSelector = () => {
  const { pokemon1 , pokemon2 } = useParams();
  const navigate = useNavigate();
  const [pokemon1Data , setPokemon1Data] = useState(null);
  const [pokemon2Data , setPokemon2Data] = useState(null);
  const [pokemon1Moves , setPokemon1Moves] = useState([]);
  const [pokemon2Moves , setPokemon2Moves] = useState([]);
  const [selectedMoves1 , setSelectedMoves1] = useState([]);
  const [selectedMoves2 , setSelectedMoves2] = useState([]);
  const [loading , setLoading] = useState(true);
  const [currentPokemon , setCurrentPokemon] = useState(1);
  const [searchTerm , setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setLoading(true);
        
        const [p1Data , p2Data] = await Promise.all([
          getPokemon(pokemon1) ,
          getPokemon(pokemon2)
        ]);
        
        setPokemon1Data(p1Data);
        setPokemon2Data(p2Data);
        
        //Change Number of Moves
        const [p1Moves , p2Moves] = await Promise.all([
          getAttackMoves(p1Data , 20) ,
          getAttackMoves(p2Data , 20)
        ]);
        
        setPokemon1Moves(p1Moves);
        setPokemon2Moves(p2Moves);
        
        //Random Moves
        setSelectedMoves1(p1Moves.slice(0 , 4));
        setSelectedMoves2(p2Moves.slice(0 , 4));
        
      } catch (error) {
        console.error("Error fetching Pokémon Data:" , error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPokemonData();
  } , [pokemon1 , pokemon2]);

  //Move Selection
  const toggleMoveSelection = (move , pokemonNumber) => {
    if(pokemonNumber === 1) {
      if(selectedMoves1.some(m => m.id === move.id)) {
   
        setSelectedMoves1(selectedMoves1.filter(m => m.id !== move.id));
        
      } else if (selectedMoves1.length < 4) {

        setSelectedMoves1([...selectedMoves1 , move]);
      }
    } else {

      if(selectedMoves2.some(m => m.id === move.id)) {
        
        setSelectedMoves2(selectedMoves2.filter(m => m.id !== move.id));

      } else if (selectedMoves2.length < 4) {

        setSelectedMoves2([...selectedMoves2 , move]);
      }
    }
  };

  //Randomize Moves
  const randomizeMoves = (pokemonNumber) => {
    if(pokemonNumber === 1) {
      const shuffled = [...pokemon1Moves].sort(() => 0.5 - Math.random());
      setSelectedMoves1(shuffled.slice(0 , 4));

    } else {
      const shuffled = [...pokemon2Moves].sort(() => 0.5 - Math.random());
      setSelectedMoves2(shuffled.slice(0 , 4));
    }
  };


  const startBattle = () => {
    if(selectedMoves1.length === 0 || selectedMoves2.length === 0) {
      alert("Each Pokémon Must have at least One Move selected!");
      return;
    }
    const moves1Param = selectedMoves1.map(m => m.id).join(",");
    const moves2Param = selectedMoves2.map(m => m.id).join(",");
    

    navigate(`/battle/${pokemon1}/${pokemon2}/${moves1Param}/${moves2Param}`);
  };

  //Move Filter
  const getFilteredMoves = () => {
    const moves = currentPokemon === 1 ? pokemon1Moves : pokemon2Moves;
    if(!searchTerm) return moves;
    
    return moves.filter(move => 
      move.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      move.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if(loading) {
    return <div className = "loading"> Loading Pokémon move data... </div>;
  }

  const currentPokemonData = currentPokemon === 1 ? pokemon1Data : pokemon2Data;
  const currentSelectedMoves = currentPokemon === 1 ? selectedMoves1 : selectedMoves2;
  const filteredMoves = getFilteredMoves();

  return (
    <div className = "moveSelectorContainer">
      <h1>Select Moves</h1>
      
      <div className = "pokemonTabs">
        <button 
          className = {`pokemonTab ${currentPokemon === 1 ? "active" : ""}`}
          onClick = {() => setCurrentPokemon(1)}>
            
          {pokemon1Data?.name.charAt(0).toUpperCase() + pokemon1Data?.name.slice(1)}
        </button>

        <button 
          className = {`pokemonTab ${currentPokemon === 2 ? "active" : ""}`}
          onClick = {() => setCurrentPokemon(2)}>
            
          {pokemon2Data?.name.charAt(0).toUpperCase() + pokemon2Data?.name.slice(1)}
        </button>
    </div>
      
      <div className = "pokemonPreview">
        <img 
          src = {currentPokemonData?.sprites.front_default} alt = {currentPokemonData?.name} className = "pokemonSprite"/>

        <div className = "pokemonInfo">
          <h2>{currentPokemonData?.name.charAt(0).toUpperCase() + currentPokemonData?.name.slice(1)}</h2>
          <div className = "pokemonTypes">
            {currentPokemonData?.types.map((type , index) => (
              <span key = {index} className = {`typeBadge ${type.type.name}`}>
                {type.type.name}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className = "moveSelection">
        <div className = "selectedMoves">
          <h3>Selected Moves ({currentSelectedMoves.length}/4)</h3>
          <div className = "selectedMovesList">
            {currentSelectedMoves.length > 0 ? (
              currentSelectedMoves.map(move => (
                <div key = {move.id} className = {`moveCard selected ${move.type}`}>
                  <div className = "moveHeader">
                    <span className = "moveName">{move.name}</span>
                    <button className = "removeMove" onClick={() => toggleMoveSelection(move , currentPokemon)}> ✕ </button>
                  </div>

                  <div className="moveDetails">
                    <span className="moveType">{move.type}</span>
                    <span className="moveCategory">{move.category}</span>
                    <span className="movePower"> Power: {move.power}</span>
                    <span className="moveAccuracy"> Accuracy: {move.accuracy}</span>
                  </div>
                </div>
              )) ) : (<p className = "noMoves"> No Moves selected. Choose up to 4 Moves below. </p>)}
          </div>

          <button className = "randomizeButton" onClick = {() => randomizeMoves(currentPokemon)}> Randomize Moves </button>
        </div>
        
        <div className = "availableMoves">
          <h3>Available Moves ({filteredMoves.length})</h3>
          <div className = "movesSearch">
            <input type = "text" placeholder = "Search moves..." value = {searchTerm}onChange = {(e) => setSearchTerm(e.target.value)}/>
          </div>

          <div className = "availableMovesList">
            {filteredMoves.map(move => {
              const isSelected = currentSelectedMoves.some(m => m.id === move.id);
              const isDisabled = currentSelectedMoves.length >= 4 && !isSelected;
              
              return (
                <div 
                  key = {move.id} 
                  className = {`moveCard ${move.type} ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                  onClick = {() => !isDisabled && toggleMoveSelection(move , currentPokemon)}
                >
                  <div className = "moveHeader">
                    <span className = "moveName">{move.name}</span>
                    {isSelected && <span className = "selectedIndicator">✓</span>}
                  </div>

                  <div className = "moveDetails">
                    <span className = "moveType">{move.type}</span>
                    <span className = "moveCategory">{move.category}</span>
                    <span className = "movePower">Power: {move.power}</span>
                    <span className = "moveAccuracy"> Accuracy: {move.accuracy} </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className = "actionButtons">
        <button className = "backButton" onClick = {() => navigate("/")}> Back to Selection </button>
        <button className = "startBattleButton"
          onClick = {startBattle}
          disabled = {selectedMoves1.length === 0 || selectedMoves2.length === 0}> Start Battle </button>
      </div>
    </div>
  );
};

export default MoveSelector;
