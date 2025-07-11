
***Pokémon Battle App***

A React-based web application that simulates Pokémon battles with move selection, battle animations, and dynamic gameplay. 

Built using the PokéAPI: https://pokeapi.co/

*Live Demo:*

https://pokebattleapp.netlify.app/

**Features:**

- One on one battles between the original 151 Pokémon
- Choose the Pokémon or randomize the matchup
- Have a quick battle with randomized moves or choose your moves before starting battle 
- Battle log that tracks actions during combat

**Unresolved/Future Additions**

- This is a very simplified battle system so far the logic is only implemented for moves that do damage. I will flesh this out to account for stats buffs/debuffs, status effects and type matchups in the future.

- You are also currently battling yourself I will change this so you are battling the computer.


**Technologies Used:**

CSS: Custom styling with animations for battle effects
React: For building the user interface
React Router: For navigation between different components

Axios: For making API requests to the PokéAPI
PokéAPI: External API providing:
- Pokémon (name, stats, types, sprites)
- Move (name, power, accuracy, type)
- List of Pokémon for the selection screen



**Approach:**

*Components-*

PokemonSelector: Allows users to select Pokémon for the battle
MoveSelector: Enables customization of each Pokémon's moveset
Battle: Handles the battle logic and animations
PokemonApi: For interacting with the PokéAPI

*State Management-*

useState and useEffect hooks manage:

Pokémon data and stats
Move selection and battle state
Battle log updates
Animations



Pokémon is a trademark of Nintendo, Game Freak, and Creatures Inc.