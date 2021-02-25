import { trimLines } from "./helpers/string.ts";
import { Car, Dataset, Intersection, Street } from "./model.ts";

export async function readDataset(inputFilePath: string): Promise<Dataset> {
  const input = await Deno.readTextFile(inputFilePath);

  const lines = trimLines(input.split("\n"));
  let lineIndex = 0;
  const nextLine = () => lines[lineIndex++];

  const [duration, intersectionsCount, streetsCount, carsCount, bonusPerCar] =
    parseNumbers(nextLine());

  const intersections = new Array<Intersection>(intersectionsCount);
  for (let i = 0; i < intersectionsCount; ++i) {
    intersections[i] = {
      id: i,
      arrivals: [],
      departures: [],
    };
  }

  const streets = new Array<Street>(streetsCount);
  const streetsByName = new Map<string, Street>();

  for (let i = 0; i < streetsCount; ++i) {
    const [bstr, estr, name, durationstr] = nextLine().split(" ");
    const from = intersections[Number(bstr)];
    const to = intersections[Number(estr)];
    const duration = Number(durationstr);

    const street: Street = { name, from, to, duration };
    streets[i] = street;
    from.departures.push(street);
    to.arrivals.push(street);
    streetsByName.set(name, street);
  }

  const cars = new Array<Car>(carsCount);
  for (let i = 0; i < carsCount; ++i) {
    const [pstr, ...streetNames] = nextLine().split(" ");
    const car: Car = {
      paths: streetNames.map((name) => streetsByName.get(name)!),
    };
    cars[i] = car;
  }

  return {
    name: inputFilePath.split("/").pop()!,
    duration,
    streets,
    intersections,
    cars,
    bonusPerCar,
  };
}

export function getDatasetInfo(dataset: Dataset) {
  return {
    "Dataset": dataset.name,
    "Teams": countTotalTeams(dataset),
    "People": countTotalPeople(dataset),
    "Pizzas": countTotalPizzas(dataset),
    "Ingredients": countTotalIngredients(dataset),
  };
}

export function countTotalTeams({ teams }: Dataset) {
  return teams.reduce(
    (count, { teamCount }) => count + teamCount,
    0,
  );
}

export function countTotalPeople({ teams }: Dataset) {
  return teams.reduce(
    (count, { personCount, teamCount }) => count + personCount * teamCount,
    0,
  );
}

export function countTotalPizzas({ pizzas }: Dataset) {
  return pizzas.length;
}

export function countTotalIngredients({ pizzas }: Dataset) {
  return pizzas.reduce((ingredients, pizza) => {
    pizza.ingredients.forEach((ingredient) => ingredients.add(ingredient));
    return ingredients;
  }, new Set<number>()).size;
}

let ingredientMap = new Map<string, number>();

function parseTeams(line: string): Team[] {
  return line.split(" ")
    .slice(1)
    .map(Number)
    .map((teamCount, i) => ({
      personCount: i + 2,
      teamCount,
    }));
}

function parsePizza(line: string, pizzaId: number): Pizza {
  return {
    id: pizzaId,
    ingredients: line.split(" ").slice(1).map((ingredientString) => {
      let ingredient = ingredientMap.get(ingredientString);
      if (ingredient === undefined) {
        ingredient = ingredientMap.size;
        ingredientMap.set(ingredientString, ingredient);
      }
      return ingredient;
    }),
  };
}

function parseNumbers(line: string) {
  return line.split(" ").map(Number);
}
