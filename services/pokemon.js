const superagent = require("superagent");

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

const Pokemon = async (req, res, next) => {
  const pokeIds = req.body.ids;

  if (!pokeIds) {
    res.status(400).send('IDs must be supplied');
  }

  const pokeData = await Promise.all(pokeIds.map(async id => {
    let pokemon, pokemonObj, response;

    try {
      response = await superagent.get(`${BASE_URL}/${id}/`);
      pokemon = response.body;
    } catch (err) {
      pokemon = null;
    }

    if ( pokemon ) {
      const { body: speciesInfo } = await superagent.get(pokemon.species.url);

      const movesWithDescriptions = await Promise.all(pokemon.moves.slice(0, 4).map( async ({ move }) => {
        const { name: moveName, url: moveUrl } = move;

        const { body: moveInfo } = await superagent.get(moveUrl);

        return {
          description: moveInfo.flavor_text_entries[0].flavor_text,
          name: moveName,
          type: moveInfo.type.name,
        }
      }));

      pokemonObj = {
        id: id,
        color: speciesInfo.color.name,
        description: speciesInfo.flavor_text_entries[0].flavor_text,
        name: pokemon.name,
        moves: movesWithDescriptions,
        types: pokemon.types.map(({type}) => type.name),
        sprite: pokemon.sprites.front_default,
      };
    } else {
      pokemonObj = {
        name: "notfound",
      }
    }

    return pokemonObj;
  }));

  res.status(200).send(pokeData);
  next();
};

module.exports = Pokemon;
