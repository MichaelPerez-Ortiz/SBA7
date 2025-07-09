import axios from "axios"

const api = axios.create({
    baseURL: "https://pokeapi.co/api/v2/"
});

const getPokemon = async(name) => {
    const response = await api.get(`pokemon/${name}`);
  return response.data;
};

const getRandomPokemon = async () => {
  const response = await api.get("pokemon?limit=151");
  const randomIndex = Math.floor(Math.random() * response.data.results.length);
  const randomPokemon = response.data.results[randomIndex];
  return getPokemon(randomPokemon.name);
};

export { getPokemon, getRandomPokemon };
