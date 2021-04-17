const app = require("./index");

const port = 3001;

app.listen(port, () => {
  console.log(`Nick's PokeAPI listening at http://localhost:${port}`);
});
