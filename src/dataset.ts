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

    const street: Street = { id: i, name, from, to, duration };
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
    inputFilePath,
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
    "Duration": dataset.duration,
    "Streets": dataset.streets.length,
    "Avg street duration": computeAvgStreetDuration(dataset),
    "Intersections": dataset.intersections.length,
    "Avg cars per intersection": computeIntersectionCars(dataset),
    "Cars": dataset.cars.length,
    "Avg Path length": computeAvgPathLength(dataset),
    "Bonus per car": dataset.bonusPerCar,
  };
}

function parseNumbers(line: string) {
  return line.split(" ").map(Number);
}

function computeAvgPathLength(dataset: Dataset) {
  return avg(dataset.cars.map((car) => car.paths.length));
}

function computeAvgStreetDuration(dataset: Dataset) {
  return avg(dataset.streets.map((street) => street.duration));
}

function computeIntersectionCars(dataset: Dataset) {
  const intersectionsCounts = new Array(dataset.intersections.length).fill(0);
  for (const car of dataset.cars) {
    for (const street of car.paths.slice(0, -1)) {
      ++intersectionsCounts[street.to.id];
    }
  }
  return avg(intersectionsCounts);
}

function avg(array: number[]) {
  const sum = array.reduce((acc, value) => acc + value, 0);
  return sum / array.length;
}
