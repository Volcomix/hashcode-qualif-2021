import { readDataset } from "./dataset.ts";
import { NumberSet } from "./helpers/number_set.ts";
import { trimLines } from "./helpers/string.ts";
import { Dataset, Schedule, Submission } from "./model.ts";

export async function writeSubmission(name: string, submission: Submission) {
  const submissionDirPath = getSubmissionDirPath(name);
  try {
    await Deno.mkdir(submissionDirPath, { recursive: true });
  } catch {
    // Submission directory already exists
  }
  const fileName = `${submission.score}.out`;
  const lines = [
    `${submission.schedules.length}`,
    ...submission.schedules.flatMap(formatSchedule),
  ];
  await Deno.writeTextFile(
    `${submissionDirPath}/${fileName}`,
    lines.join("\n"),
  );
}

// export async function readSubmission(
//   dataset: Dataset,
// ): Promise<Submission> {
//   const submissionFilePath = await getBestSubmissionFilePath(dataset);
//   const content = await Deno.readTextFile(submissionFilePath);
//   const [_deliveryCountLine, ...deliveryLines] = trimLines(content.split("\n"));
//   return {
//     deliveries: deliveryLines.map((line) => parseDelivery(line, dataset)),
//   };
// }

export function getSubmissionInfo(name: string, submission: Submission) {
  const score = getSubmissionScore(submission);
  return {
    "Dataset": name,
    "Schedules": submission.schedules.length,
    "Score": score,
    "Submission file": `${getSubmissionDirPath(name)}/${score}.out`,
  };
}

// export function getDeliveryScore(pizzas: Pizza[]) {
// ingredients.clear();
// let ingredientCount = 0;
// for (const pizza of pizzas) {
//   for (const ingredient of pizza.ingredients) {
//     if (!ingredients.has(ingredient)) {
//       ingredients.add(ingredient);
//       ingredientCount++;
//     }
//   }
// }
// return ingredientCount * ingredientCount;
// }

export function getSubmissionScore({ schedules }: Submission): number {
  return 0;
}

function getSubmissionDirPath(name: string): string {
  return `submission/${name}`;
}

async function getBestSubmissionFilePath(dataset: Dataset): Promise<string> {
  const submissionDirPath = getSubmissionDirPath(dataset.name);
  let highestScore = -Infinity;
  for await (const submissionFile of Deno.readDir(submissionDirPath)) {
    highestScore = Math.max(
      highestScore,
      Number(submissionFile.name.split(".")[0]),
    );
  }
  return `${submissionDirPath}/${highestScore}.out`;
}

function formatSchedule({ intersection, items }: Schedule): string[] {
  return [
    `${intersection.id}`,
    `${items.length}`,
    ...items.map(({ street, duration }) => `${street.name} ${duration}`),
  ];
}

// function parseDelivery(line: string, dataset: Dataset): Delivery {
//   const pizzas = line.split(" ").slice(1).map(Number).map((pizzaId) =>
//     dataset.pizzas[pizzaId]
//   );
//   return {
//     score: getDeliveryScore(pizzas),
//     pizzas,
//   };
// }

const ingredients = new NumberSet(10000);
