import { BrowserRouter, Route , Routes } from "react-router-dom"
import PokemonSelector from "./components/PokemonSelector"
import Battle from "./components/Battle"


function App() {
 
  return (
      <Routes>
        <Route path = "/" element = {<PokemonSelector/>} />
        <Route path = "/battle/:pokemon1/:pokemon2" element = {<Battle/>} />
      </Routes>
  )
}

export default App
