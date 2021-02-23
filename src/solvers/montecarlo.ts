import { Dataset, Pizza } from "../dataset.ts";
import { shuffle } from "../helpers/array.ts";
import { NumberSet } from "../helpers/number_set.ts";
import { WorkerProgress } from "../helpers/worker.ts";
import { getSubmissionScore, Submission } from "../submission.ts";

self.onmessage = ({ data: dataset }: MessageEvent<Dataset>) => {
  const progress: WorkerProgress = { completed: 0, total: 100000 };
  self.postMessage(progress);
  const { pizzas } = dataset;
  const teams = dataset.teams.flatMap(({ personCount, teamCount }) =>
    Array.from({ length: teamCount }, () => personCount)
  );
  const ingredients = new NumberSet(10000);
  let startTime = Date.now();
  let highestScore = -Infinity;
  while (true) {
    const submission: Submission = { deliveries: [] };
    shuffle(pizzas);
    shuffle(teams);
    let pizzaIdx = 0;
    for (
      let teamIdx = 0;
      teamIdx < teams.length && pizzaIdx < pizzas.length &&
      teams[teamIdx] <= pizzas.length - pizzaIdx;
      teamIdx++
    ) {
      const personCount = teams[teamIdx];
      const pizzasToDeliver: Pizza[] = [];
      ingredients.clear();
      let ingredientCount = 0;
      for (
        let personIdx = 0;
        personIdx < personCount && pizzaIdx < pizzas.length;
        personIdx++
      ) {
        const pizza = pizzas[pizzaIdx++];
        pizzasToDeliver.push(pizza);
        for (const ingredient of pizza.ingredients) {
          if (!ingredients.has(ingredient)) {
            ingredients.add(ingredient);
            ingredientCount++;
          }
        }
      }
      if (pizzasToDeliver.length === personCount) {
        submission.deliveries.push({
          score: ingredientCount * ingredientCount,
          pizzas: pizzasToDeliver,
        });
      } else {
        pizzaIdx -= pizzasToDeliver.length;
      }
    }
    progress.completed = (progress.completed + 1) % progress.total;
    const endTime = Date.now();
    if (endTime - startTime > 500) {
      self.postMessage(progress);
      startTime = endTime;
    }
    const score = getSubmissionScore(submission);
    if (score > highestScore) {
      self.postMessage(submission);
      highestScore = score;
    }
  }
};
