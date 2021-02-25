import {
  Car,
  Dataset,
  Intersection,
  Schedule,
  Street,
  Submission,
} from "./model.ts";

function runSchedule(dataset: Dataset, submission: Submission) {
  const lights = new Map<Intersection, Street>();
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
    dataset.cars.map((car) => ([car, 0])),
  );
  const secondsToNextStreet = new Map<Car, number>(
    dataset.cars.map((car) => ([car, 0])),
  );

  for (let second = 0; second < dataset.duration; second++) {
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
    for (const car of dataset.cars) {
      const secondToNextStreet = secondsToNextStreet.get(car)!;
      if (secondToNextStreet === second) {
        let streetIdx = streetIdxs.get(car)!;
        streetIdx++;
        if (streetIdx === car.paths.length) {
          // TODO Score and remove car
        }
        streetIdxs.set(car, streetIdx);
        const street = car.paths[streetIdx];
        secondsToNextStreet.set(car, second + street.duration);
      }
    }
  }
}
