import { loop } from './utils'; // Assuming utils.ts is in the same directory

const evaluatorPrompt: string = `
Evaluate this following code implementation for:
1. code correctness
2. time complexity
3. style and best practices

You should be evaluating only and not attempting to solve the task.
Only output "PASS" if all criteria are met and you have no further suggestions for improvements.
Output your evaluation concisely in the following format. **Crucially, both the <evaluation> and <feedback> tags MUST contain content.**

<evaluation>**MUST PROVIDE ONE OF, DONT GIVE EMPTY TAGS: PASS, NEEDS_IMPROVEMENT, or FAIL**</evaluation>
<feedback>
**MUST PROVIDE FEEDBACK, DONT GIVE EMPTY FEEDBACK** Explain what needs improvement and why, or state "All criteria met." if the evaluation is PASS.
</feedback>
`;

const generatorPrompt: string = `
Your goal is to complete the task based on <user input>. If there are feedback
from your previous generations, you should reflect on them to improve your solution

Output your answer concisely in the following format:

<thoughts>
[Your understanding of the task and feedback and how you plan to improve]
</thoughts>

<response>
[Your code implementation here]
</response>
`;

const task: string = `
<user input>
Implement a Stack with:
1. push(x)
2. pop()
3. getMin()
All operations should be O(1).
</user input>
`;

// Function to run the loop and handle the output
async function runOptimizationLoop() {
  try {
    console.log("Starting the optimization loop...");
    const [finalResult, history] = await loop(task, evaluatorPrompt, generatorPrompt);

    console.log("\n✅ Loop finished successfully!");
    console.log("\n=== Final Result ===");
    console.log(finalResult);

    console.log("\n=== Chain of Thought History ===");
    history.forEach((item, index) => {
      console.log(`\n--- Attempt ${index + 1} ---`);
      console.log(`Thoughts:\n${item.thoughts}`);
      console.log(`Result:\n${item.result}`);
    });

  } catch (error) {
    console.error("An error occurred during the optimization loop:", error);
  }
}

// Execute the function
runOptimizationLoop();
