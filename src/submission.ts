import { Pizza } from "./dataset.ts";

export type Submission = {
  deliveries: Delivery[];
};

export type Delivery = {
  score: number;
  pizzas: Pizza[];
};

export async function writeSubmission(name: string, submission: Submission) {
  const submissionDir = getSubmissionDirectory(name);
  try {
    await Deno.mkdir(submissionDir, { recursive: true });
  } catch {
    // Submission directory already exists
  }
  const fileName = `${getSubmissionScore(submission)}.out`;
  const lines = [
    `${submission.deliveries.length}`,
    ...submission.deliveries.map(formatDelivery),
  ];
  await Deno.writeTextFile(`${submissionDir}/${fileName}`, lines.join("\n"));
}

export function getSubmissionInfo(name: string, submission: Submission) {
  const score = getSubmissionScore(submission);
  return {
    "Dataset": name,
    "Deliveries": submission.deliveries.length,
    "Score": score,
    "Submission file": `${getSubmissionDirectory(name)}/${score}.out`,
  };
}

export function getSubmissionScore({ deliveries }: Submission): number {
  return deliveries.reduce((score, delivery) => score + delivery.score, 0);
}

function getSubmissionDirectory(name: string): string {
  return `submission/${name}`;
}

function formatDelivery({ pizzas }: Delivery): string {
  return `${pizzas.length} ${pizzas.map(({ id }) => id).join(" ")}`;
}
