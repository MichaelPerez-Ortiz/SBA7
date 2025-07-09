import { Route , Routes } from "react-router-dom"
import PokemonSelector from "./components/PokemonSelector"
import Battle from "./components/Battle"
import MoveSelector from "./components/MoveSelector"


function App() {
 
  return (
      <Routes>
        <Route path = "/" element = {<PokemonSelector/>} />
        <Route path = "/moves/:pokemon1/:pokemon2" element = {<MoveSelector/>} />
        <Route path = "/battle/:pokemon1/:pokemon2/:moves1/:moves2" element = {<Battle/>} />
      </Routes>
  )
}

export default App
