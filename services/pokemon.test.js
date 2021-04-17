const superagent = require("superagent");
const request = require("supertest");
const app = require("../index");

describe("Pokemon tests", () => {
  beforeEach(() => {
    superagent.get = jest.fn();
  });

  it("Makes a call to the pokemon API using the provided IDs", async () => {
    superagent.get.mockReturnValue({
      body: {
        name: "bulbasaur",
        types: [],
        sprites: { front_default: "" },
      },
    });

    const response = await request(app)
      .post("/pokemon")
      .send({
        ids: [1, 2, 6],
      });

    expect(response.status).toEqual(200);
    expect(superagent.get).toHaveBeenCalledTimes(3);
    expect(superagent.get).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon/1/"
    );
    expect(superagent.get).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon/2/"
    );
    expect(superagent.get).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon/6/"
    );
  });

  it("Returns the data in the proper format", async () => {
    superagent.get.mockReturnValueOnce({
      body: {
        name: "bulbasaur",
        types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
        sprites: { front_default: "somespriteurl" },
      },
    });
    superagent.get.mockReturnValueOnce({
      body: {
        name: "charmander",
        types: [{ type: { name: "fire" } }],
        sprites: { front_default: "someotherspriteurl" },
      },
    });
    superagent.get.mockReturnValueOnce({
      body: {
        name: "charmeleon",
        types: [{ type: { name: "fire" } }],
        sprites: { front_default: "someotherspriteurl" },
      },
    });

    const response = await request(app)
      .post("/pokemon")
      .send({
        ids: [1, 2, 6],
      });

    expect(response.status).toEqual(200);
    expect(superagent.get).toHaveBeenCalledTimes(3);
    expect(response.body).toEqual([
      {
        name: "bulbasaur",
        sprite: "somespriteurl",
        types: ["grass", "poison"],
      },
      {
        name: "charmander",
        sprite: "someotherspriteurl",
        types: ["fire"],
      },
      {
        name: "charmeleon",
        sprite: "someotherspriteurl",
        types: ["fire"],
      },
    ]);
  });

  it("Fails gracefully if a Pokemon ID is not found", async () => {
    superagent.get.mockImplementationOnce(() => {
      const err = new Error("not found");
      throw err;
    });
    superagent.get.mockReturnValueOnce({
      body: {
        name: "charmander",
        types: [{ type: { name: "fire" } }],
        sprites: { front_default: "someotherspriteurl" },
      },
    });

    const response = await request(app)
      .post("/pokemon")
      .send({
        ids: [12000, 2],
      });

    expect(response.status).toEqual(200);
    expect(superagent.get).toHaveBeenCalledTimes(2);
    expect(response.body).toEqual([
      {
        name: "notfound",
      },
      {
        name: "charmander",
        sprite: "someotherspriteurl",
        types: ["fire"],
      },
    ]);
  });
});
