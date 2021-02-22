import { exampleDataset } from "./dataset.test.ts";
import { assertEquals } from "./deps.ts";
import { getSubmissionInfo, Submission } from "./submission.ts";

export const exampleSubmission: Submission = {
  deliveries: [
    {
      score: 16,
      pizzas: [
        exampleDataset.pizzas[1],
        exampleDataset.pizzas[4],
      ],
    },
    {
      score: 49,
      pizzas: [
        exampleDataset.pizzas[0],
        exampleDataset.pizzas[2],
        exampleDataset.pizzas[3],
      ],
    },
  ],
};

Deno.test("getSubmissionInfo", () => {
  assertEquals(getSubmissionInfo(exampleDataset.name, exampleSubmission), {
    "Dataset": "a_example",
    "Deliveries": 2,
    "Score": 65,
    "Submission file": "submission/a_example/65.out",
  });
});
