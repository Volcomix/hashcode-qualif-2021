import {
  Car,
  Dataset,
  Intersection,
  Schedule,
  Street,
  Submission,
} from "./model.ts";

export function simulate(dataset: Dataset, submission: Submission): number[] {
  const timeByLight = dataset.streets.map((_) => 0);

  const lights = new Map<Intersection, Street>();
  const carsByLight = new Map<Street, Car[]>(
    dataset.streets.map((street) => ([street, []])),
  );
  const schedulesByIntersection = new Map<Intersection, Schedule>(
    submission.schedules.map((schedule) => ([schedule.intersection, schedule])),
  );
  const scheduleItemIdxs = new Map<Intersection, number>(
    submission.schedules.map((schedule) => ([schedule.intersection, -1])),
  );
  const secondsToNextScheduleItem = new Map<Intersection, number>(
    submission.schedules.map((schedule) => ([schedule.intersection, 0])),
  );
  const streetIdxs = new Map<Car, number>(
    dataset.cars.map((car) => ([car, 1])),
  );
  const secondsToEnd = new Map<Car, number>(
    dataset.cars.map((car) => ([car, 0])),
  );
  const drivingCars = new Set<Car>();

  for (const car of dataset.cars) {
    carsByLight.get(car.paths[0])!.push(car);
  }

  let score = 0;

  for (let second = 0; second < dataset.duration; second++) {
    for (let i = 0; i < dataset.streets.length; i++) {
      const st = dataset.streets[i];
      timeByLight[i] += carsByLight.get(st)!.length;
    }
    for (const intersection of dataset.intersections) {
      const schedule = schedulesByIntersection.get(intersection);
      if (!schedule) {
        continue;
      }
      const secondToNextScheduleItem = secondsToNextScheduleItem.get(
        intersection,
      )!;
      if (secondToNextScheduleItem === second) {
        let scheduleItemIdx = scheduleItemIdxs.get(intersection)!;
        scheduleItemIdx = (scheduleItemIdx + 1) % schedule.items.length;
        scheduleItemIdxs.set(intersection, scheduleItemIdx);
        const scheduleItem = schedule.items[scheduleItemIdx];
        lights.set(intersection, scheduleItem.street);
        secondsToNextScheduleItem.set(
          intersection,
          second + scheduleItem.duration,
        );
      }
    }
    for (const car of drivingCars) {
      const secondToEnd = secondsToEnd.get(car)!;
      if (secondToEnd === second) {
        let streetIdx = streetIdxs.get(car)!;
        drivingCars.delete(car);
        if (streetIdx === car.paths.length - 1) {
          score += dataset.bonusPerCar + dataset.duration - second;
          continue;
        }
        const street = car.paths[streetIdx];
        carsByLight.get(street)!.push(car);
        streetIdx++;
        streetIdxs.set(car, streetIdx);
      }
    }
    for (const street of lights.values()) {
      const car = carsByLight.get(street)!.shift();
      if (!car) {
        continue;
      }
      drivingCars.add(car);
      let streetIdx = streetIdxs.get(car)!;
      const nextStreet = car.paths[streetIdx];
      secondsToEnd.set(car, second + nextStreet.duration);
    }
  }

  submission.score = score;

  return timeByLight;
}
