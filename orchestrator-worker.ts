import { FlexibleOrchestrator } from "./utils"; // Assuming utils.ts is in the same directory

// Define the prompt templates as constants
const ORCHESTRATOR_PROMPT = `
Analyze this task and break it down into 2-3 distinct approaches:

Task: {task}
Target Audience: {target_audience}
Key Features: {key_features}

Return your response in this format:

<analysis>
Explain your understanding of the task and which variations would be valuable.
Focus on how each approach serves different aspects of the task based on the provided context.
</analysis>

<tasks>
    <task>
    <type>formal</type>
    <description>Write a precise, technical version that emphasizes specifications like materials, dimensions, and performance.</description>
    </task>
    <task>
    <type>conversational</type>
    <description>Write an engaging, friendly version that connects with the target audience, highlighting benefits and eco-friendly aspects.</description>
    </task>
</tasks>
`;

const WORKER_PROMPT = `
Generate content based on:
Original Task: {original_task}
Style: {task_type}
Guidelines: {task_description}
Target Audience: {target_audience}
Key Features: {key_features}

Return your response in this format:

<response>
Your content here, maintaining the specified style and fully addressing requirements based on the provided context.
</response>
`;

// Instantiate the orchestrator
const orchestrator = new FlexibleOrchestrator(
  ORCHESTRATOR_PROMPT,
  WORKER_PROMPT
);

// Define the task and context
const task = "Write a product description for a new eco-friendly water bottle";
const context = {
  target_audience: "environmentally conscious millennials",
  // Note: Key features should ideally be passed as a string or processed accordingly
  // if the formatPrompt function expects simple string replacement.
  // If formatPrompt handles arrays, this is fine. Assuming string for now.
  key_features: "plastic-free, insulated, lifetime warranty",
};

// Main execution function
async function runOrchestration() {
  try {
    console.log("Starting orchestration process...");
    const results = await orchestrator.process(task, context);

    console.log("\n=== FINAL ORCHESTRATION RESULTS ===");
    console.log(`\nOrchestrator Analysis:\n${results.analysis}`);

    console.log("\nWorker Results:");
    results.worker_results.forEach((workerResult, index) => {
      console.log(`\n--- Worker ${index + 1} (${workerResult.type}) ---`);
      console.log(`Description: ${workerResult.description}`);
      console.log(`Result:\n${workerResult.result}`);
    });

    console.log("\nOrchestration process completed.");

  } catch (error) {
    console.error("\nAn error occurred during orchestration:", error);
  }
}

// Run the orchestration
runOrchestration();
