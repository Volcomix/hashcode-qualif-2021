import { WORKER_DONE, WorkerProgress } from "../helpers/worker.ts";
import { Dataset, ScheduleItem, Submission } from "../model.ts";
import { readDataset } from "../dataset.ts";
import { writeSubmission } from "../submission.ts";
import { simulate } from "../simulation.ts";

const TRIES = 100;

self.onmessage = async ({ data: inputFilePath }: MessageEvent<string>) => {
  const dataset = await readDataset(inputFilePath);
  const submission: Submission = { schedules: [], score: 0 };

  const progress: WorkerProgress = {
    completed: 0,
    total: TRIES,
  };

  self.postMessage(progress);

  //let startTime = Date.now();

  const weights = new Array(dataset.streets.length).fill(0);
  for (const car of dataset.cars) {
    for (const street of car.paths) {
      ++weights[street.id];
    }
  }

  let bestScore = 0;

  for (let i = 0; i < TRIES; ++i) {
    for (const intersection of dataset.intersections) {
      const items: ScheduleItem[] = [];

      const totalWeight = intersection.arrivals.reduce(
        (acc, street) => acc + weights[street.id],
        0,
      );

      const weightPerArrival = intersection.arrivals.map((street) => ({
        street,
        weight: weights[street.id],
      })).filter(({ weight }) => weight > 0);

      // avg 3 sec per arrival
      const totalDuration = weightPerArrival.length * 3;

      for (const { street, weight } of weightPerArrival) {
        const duration = Math.min(
          1,
          Math.round(totalDuration * weight / totalWeight),
        );
        if (duration > 0) {
          items.push({ duration, street });
        }
      }

      if (items.length > 0) {
        shuffle(items);
        submission.schedules.push({ intersection, items });
      }
    }

    const score = simulate(dataset, submission);

    if (score > bestScore) {
      await writeSubmission(dataset.name, submission);
      bestScore = score;
    }

    progress.completed = i;
    self.postMessage(progress);
  }

  progress.completed = TRIES;
  self.postMessage(progress);
  //self.postMessage(submission);
  self.postMessage(WORKER_DONE);
  self.close();
};

function shuffle<T>(array: T[]) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
