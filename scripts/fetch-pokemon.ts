import axios from 'axios';
import fs from 'fs';

async function fetchAllPokemon() {
  console.log('Fetching all pokemon names from PokeAPI...');
  // 1302 is the current count approx
  const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1302');
  const pokemonList = response.data.results;
  
  // Create mapping
  const mapping = pokemonList.map((p: any) => ({
    name: p.name,
    label: `${p.name.charAt(0).toUpperCase() + p.name.slice(1)}`
  }));
  
  const dir = './src/commands/utils';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`${dir}/pokemon-list.json`, JSON.stringify(mapping, null, 2));
  console.log('Successfully saved pokemon-list.json');
}

fetchAllPokemon().catch(console.error);
