import axios from 'axios';

const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
});

const getPokemon = async (name) => {
  const response = await api.get(`pokemon/${name}`);
  return response.data;
};

const getRandomPokemon = async () => {
  const response = await api.get("pokemon?limit=151");
  const randomIndex = Math.floor(Math.random() * response.data.results.length);
  const randomPokemon = response.data.results[randomIndex];
  return getPokemon(randomPokemon.name);
};

const getMoveDetails = async (moveIdentifier) => {
try {
    let response;

    if(typeof moveIdentifier == "string" && moveIdentifier.startsWith("http")) {
        response = await axios.get(moveIdentifier);

    } else {
        const atkIdentifier = String (moveIdentifier).replace("move/" , "");
        response = await api.get(`move/${atkIdentifier}`);
    }

        return response.data;
    } catch (error) {
    console.error("Error fetching move details:" , error);

    return {
        id: 0 ,
        name: "unknown" ,
        power: 40  ,
        accuracy: 100 ,
        type: {name: "normal"} ,
        damage_class: {name: "physical"}
    };
 }
};

const getAttackMoves = async (pokemonData , limit = 4) => {
  const attackMoves = [];
  const shuffledMoves = [...pokemonData.moves].sort(() => 0.5 - Math.random());
  
  for (let moveData of shuffledMoves) {
    if (attackMoves.length >= limit) 
        break;
 try {   
      const moveDetails = await getMoveDetails(moveData.move.url);
      
      if (moveDetails.power !== null && moveDetails.power > 0) {
        attackMoves.push({
          id: moveDetails.id ,
          name: moveDetails.name.replace("-" , " ") ,
          power: moveDetails.power ,
          accuracy: moveDetails.accuracy || 100 ,
          type: moveDetails.type.name ,
          category: moveDetails.damage_class?.name || "physical"
        });
      }
    } catch (error) {
      console.error(`Error processing move ${moveData.move.name}:` , error);
    }
  }
  
  
  const defaultMoves = [
    {id: 33 , name: "tackle" , power: 40 , accuracy: 100 , type: "normal" , category: "physical"} ,
    {id: 10 , name: "scratch" , power: 40 , accuracy: 100 , type: "normal" , category: "physical"} ,
    {id: 1 , name: "pound" , power: 40 , accuracy: 100 , type: "normal" , category: "physical"} ,
    {id: 98 , name: "quick attack" , power: 40 , accuracy: 100 , type: "normal" , category: "physical"}
  ];
  
  while (attackMoves.length < limit) {
    attackMoves.push(defaultMoves[attackMoves.length % defaultMoves.length]);
  }
  
  return attackMoves;
};

export { getPokemon, getRandomPokemon, getMoveDetails, getAttackMoves };