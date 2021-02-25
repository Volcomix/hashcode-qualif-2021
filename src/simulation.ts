import {
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
  for (let second = 0; second < dataset.duration; second++) {
    for (const intersection of dataset.intersections) {
      const schedule = schedulesByIntersection.get(intersection);
      if (!schedule) {
        continue;
      }
      let scheduleItemIdx = scheduleItemIdxs.get(intersection)!;
      const secondToNextScheduleItem = secondsToNextScheduleItem.get(
        intersection,
      )!;
      if (secondToNextScheduleItem === second) {
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
  }
}
