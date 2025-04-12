import { GoogleGenAI, HarmCategory, HarmBlockThreshold, GenerateContentResponse } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/**
 * Calls the Gemini model with the given prompt and returns the response.
 *
 * @param prompt - The user prompt to send to the model.
 * @param systemPrompt - The system instruction to guide the model's behavior. Defaults to "".
 * @param modelName - The model to use for the call. Defaults to "gemini-1.5-flash-latest".
 * @returns The response text from the language model.
 */
async function llmCall(
  prompt: string,
  systemPrompt: string = "",
  modelName: string = "gemini-2.5-pro-preview-03-25"
): Promise<string> {
  try {
    // Call generateContent directly on the models object
    const result: GenerateContentResponse = await genAI.models.generateContent({
       model: modelName,
       ...(systemPrompt && { systemInstruction: systemPrompt }), // Conditionally add system instruction
       contents: [{ role: "user", parts: [{ text: prompt }] }],
       // Add safety settings if needed, example:
       // safetySettings: [
       //   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
       // ],
       // generationConfig: { maxOutputTokens: 100 },
    });

    // The result *is* the response object
    const response = result; // Keep for clarity, or just use 'result' directly

    // Check if response and candidates exist and have content using optional chaining
     if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Safe to access now
        return response.candidates[0].content.parts[0].text;
    } else {
         // Handle cases where the expected response structure is missing or empty
         console.error("Unexpected response structure or empty text:", response);
         // No simple text() fallback here, throw error if expected structure is missing
         throw new Error("Failed to get valid response text from the model. Response structure might be missing or empty.");
     }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error; // Re-throw the error after logging
  }
}

/**
 * Extracts the content of the specified XML-like tag from the given text.
 * Used for parsing structured responses.
 *
 * @param text - The text containing the XML-like structure.
 * @param tag - The tag to extract content from.
 * @returns The content of the specified tag, or an empty string if the tag is not found.
 */
function extractXml(text: string, tag: string): string {
  // Escape special regex characters in the tag name
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use a non-greedy match (.+?) and ignore case (i) and allow multiline (.)
  const regex = new RegExp(`<${escapedTag}>(.+?)<\/${escapedTag}>`, 'is');
  const match = text.match(regex);
  // Return the first captured group (the content) if found, otherwise an empty string
  return match?.[1]?.trim() ?? "";
}

// Example Usage (optional - uncomment to run)
// async function main() {
//   try {
//     const system = "You are a helpful assistant.";
//     const userPrompt = "Explain the concept of Promises in JavaScript in simple terms.";
//     const responseText = await llmCall(userPrompt, system);
//     console.log("LLM Response:\n", responseText);

//     const xmlText = "<example><data>This is the data inside the tag.</data></example>";
//     const extractedData = extractXml(xmlText, "data");
//     console.log("\nExtracted XML Content:", extractedData);

//     const missingTagText = "<other>Some other content</other>";
//     const notFound = extractXml(missingTagText, "data");
//     console.log("\nExtraction when tag not found:", notFound); // Should be ""

//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// }

// main();

// ******************************************* //

/**
 * Chains multiple LLM calls sequentially, passing the result of one step
 * as input to the next.
 *
 * @param input - The initial input string.
 * @param prompts - An array of prompts to be executed in sequence.
 * @returns The final result after all chained calls.
 */
async function chain(input: string, prompts: string[]): Promise<string> {
  let result = input;
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`\nStep ${i + 1}:`);
    // Since llmCall is async, we need to await its result in each iteration
    result = await llmCall(`${prompt}\nInput: ${result}`);
    console.log(result);
  }
  return result;
}

/**
 * Processes multiple inputs concurrently using the same prompt with the LLM.
 *
 * @param prompt - The base prompt to use for all inputs.
 * @param inputs - An array of input strings to process in parallel.
 * @returns An array of results corresponding to each input.
 */
async function parallel(prompt: string, inputs: string[]): Promise<string[]> {
  // Create an array of promises by calling llmCall for each input
  const promises = inputs.map(input => llmCall(`${prompt}\nInput: ${input}`));
  // Wait for all promises to resolve
  const results = await Promise.all(promises);
  return results;
}

/**
 * Routes an input to a specialized prompt based on LLM-based content classification.
 *
 * @param input - The input string to route.
 * @param routes - A dictionary where keys are route names (lowercase) and values are the corresponding specialized prompts.
 * @returns The result from the LLM call using the selected specialized prompt.
 */
async function route(input: string, routes: Record<string, string>): Promise<string> {
  const routeKeys = Object.keys(routes);
  console.log(`\nAvailable routes: ${routeKeys.join(', ')}`);

  // Construct the prompt for the LLM to select the route
  const selectorPrompt = `
Analyze the input and select the most appropriate support team from these options: ${routeKeys.join(', ')}
First explain your reasoning, then provide your selection in this XML format:

<reasoning>
Brief explanation of why this ticket should be routed to a specific team.
Consider key terms, user intent, and urgency level.
</reasoning>

<selection>
The chosen team name
</selection>

Input: ${input}`.trim();

  // Call the LLM to determine the route
  const routeResponse = await llmCall(selectorPrompt);

  // Extract reasoning and selection from the response
  const reasoning = extractXml(routeResponse, 'reasoning');
  const routeKey = extractXml(routeResponse, 'selection').trim().toLowerCase();

  console.log("Routing Analysis:");
  console.log(reasoning || "No reasoning provided."); // Handle empty reasoning
  console.log(`\nSelected route: ${routeKey}`);

  // Get the specialized prompt based on the selected route key
  const selectedPrompt = routes[routeKey];

  if (!selectedPrompt) {
    console.error(`Error: Route key "${routeKey}" not found in provided routes.`);
    // Decide how to handle: throw error, return default, or call with a generic prompt?
    // For now, throwing an error.
    throw new Error(`Selected route "${routeKey}" is invalid.`);
  }

  // Call the LLM again with the specialized prompt and the original input
  return llmCall(`${selectedPrompt}\nInput: ${input}`);
}


// ******************************************* //

// ******** Generation, Evaluation, Loop ********

/**
 * Generates a solution based on a prompt, task, and optional context.
 *
 * @param prompt - The base prompt for generation.
 * @param task - The specific task to perform.
 * @param context - Optional context from previous attempts or feedback.
 * @returns A promise resolving to a tuple containing thoughts and the generated result.
 */
async function generate(prompt: string, task: string, context: string = ""): Promise<[string, string]> {
  const fullPrompt = context
    ? `${prompt}\n${context}\nTask: ${task}`
    : `${prompt}\nTask: ${task}`;

  const response = await llmCall(fullPrompt);
  const thoughts = extractXml(response, "thoughts");
  const result = extractXml(response, "response");

  console.log("\n=== GENERATION START ===");
  console.log(`Thoughts:\n${thoughts}\n`);
  console.log(`Generated:\n${result}`);
  console.log("=== GENERATION END ===\n");

  return [thoughts, result];
}

/**
 * Evaluates if a given content meets the requirements of a task based on a prompt.
 *
 * @param prompt - The prompt defining evaluation criteria.
 * @param content - The content to evaluate.
 * @param task - The original task the content is trying to solve.
 * @returns A promise resolving to a tuple containing the evaluation status ("PASS" or other) and feedback.
 */
async function evaluate(prompt: string, content: string, task: string): Promise<[string, string]> {
  const fullPrompt = `${prompt}\nOriginal task: ${task}\nContent to evaluate: ${content}`;
  const response = await llmCall(fullPrompt);
  const evaluation = extractXml(response, "evaluation");
  const feedback = extractXml(response, "feedback");

  console.log("=== EVALUATION START ===");
  console.log(`Status: ${evaluation}`);
  console.log(`Feedback: ${feedback}`);
  console.log("=== EVALUATION END ===\n");

  return [evaluation, feedback];
}

type ChainOfThoughtItem = {
  thoughts: string;
  result: string;
};

/**
 * Implements a generate-evaluate loop until the evaluation passes.
 *
 * @param task - The task to accomplish.
 * @param evaluatorPrompt - The prompt for the evaluation step.
 * @param generatorPrompt - The prompt for the generation step.
 * @returns A promise resolving to a tuple containing the final passing result and the chain of thought history.
 */
async function loop(
  task: string,
  evaluatorPrompt: string,
  generatorPrompt: string
): Promise<[string, ChainOfThoughtItem[]]> {
  const memory: string[] = [];
  const chainOfThought: ChainOfThoughtItem[] = [];

  let [thoughts, result] = await generate(generatorPrompt, task);
  memory.push(result);
  chainOfThought.push({ thoughts, result });

  while (true) {
    const [evaluation, feedback] = await evaluate(evaluatorPrompt, result, task);
    if (evaluation.toUpperCase() === "PASS") {
      console.log("\n=== LOOP FINISHED: PASS ===");
      return [result, chainOfThought];
    }

    console.log("\n=== LOOP CONTINUES: REFINING ===");

    const context = [
      "Previous attempts:",
      ...memory.map(m => `- ${m}`),
      `\nFeedback: ${feedback}`
    ].join('\n');

    [thoughts, result] = await generate(generatorPrompt, task, context);
    memory.push(result);
    chainOfThought.push({ thoughts, result });
  }
}

// ******************************************* //

// ******** Flexible Orchestrator ********

interface TaskInfo {
  type: string;
  description: string;
}

interface WorkerResult {
  type: string;
  description: string;
  result: string;
}

interface OrchestratorOutput {
  analysis: string;
  worker_results: WorkerResult[];
}

/**
 * Breaks down tasks and runs them potentially in parallel using worker LLMs.
 */
class FlexibleOrchestrator {
  private orchestratorPrompt: string;
  private workerPrompt: string;

  /**
   * Initialize with prompt templates.
   * @param orchestratorPrompt - The template prompt for the orchestrator LLM.
   * @param workerPrompt - The template prompt for the worker LLMs.
   */
  constructor(orchestratorPrompt: string, workerPrompt: string) {
    this.orchestratorPrompt = orchestratorPrompt;
    this.workerPrompt = workerPrompt;
  }

  /**
   * Formats a prompt template string by replacing placeholders.
   * Placeholders are in the format {key}.
   *
   * @param template - The template string.
   * @param kwargs - An object containing key-value pairs for replacements.
   * @returns The formatted string.
   * @throws ValueError if a required variable is missing.
   */
   private formatPrompt(template: string, kwargs: Record<string, any>): string {
        let formatted = template;
        for (const key in kwargs) {
            // Use a RegExp to replace all occurrences of {key}
            // Escape key for regex special characters if necessary, though usually not needed for typical keys
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            formatted = formatted.replace(regex, String(kwargs[key])); // Ensure value is string
        }

        // Optional: Check if any placeholders remain, indicating missing keys
        const remainingPlaceholders = formatted.match(/\{[^{}]+\}/g);
        if (remainingPlaceholders) {
            // This replicates Python's KeyError behavior more closely
            throw new Error(`Missing required prompt variable(s): ${remainingPlaceholders.join(', ')}`);
        }

        return formatted;
    }

  /**
   * Processes a task by breaking it down using an orchestrator LLM and
   * then executing the subtasks using worker LLMs.
   *
   * @param task - The main task description.
   * @param context - Optional additional context to provide to the LLMs.
   * @returns An object containing the orchestrator's analysis and results from workers.
   */
  async process(task: string, context?: Record<string, any>): Promise<OrchestratorOutput> {
    const effectiveContext = context || {};

    // Step 1: Get orchestrator response
    const orchestratorInput = this.formatPrompt(this.orchestratorPrompt, {
      task: task,
      ...effectiveContext,
    });
    const orchestratorResponse = await llmCall(orchestratorInput);

    // Parse orchestrator response
    const analysis = extractXml(orchestratorResponse, "analysis");
    const tasksXml = extractXml(orchestratorResponse, "tasks");

    // --- DEBUGGING START ---
    console.log("\n=== DEBUG: Raw tasksXml ===");
    console.log(tasksXml);
    console.log("=== DEBUG: End raw tasksXml ===\n");
    // --- DEBUGGING END ---

    // Step 1.5: Parse tasks using Regex
    const subTasks: TaskInfo[] = [];
    // Regex to find each <task> block and capture type and description
    const taskRegex = /<task>\s*<type>(.*?)<\/type>\s*<description>(.*?)<\/description>\s*<\/task>/gis;
    let match;

    while ((match = taskRegex.exec(tasksXml)) !== null) {
        // match[1] is the content of <type>
        // match[2] is the content of <description>
        if (match[1] && match[2]) {
            subTasks.push({
                type: match[1].trim(),
                description: match[2].trim(),
            });
        }
    }

    console.log("\n=== ORCHESTRATOR OUTPUT ===");
    console.log(`\nANALYSIS:\n${analysis}`);
    console.log(`\nTASKS:\n${JSON.stringify(subTasks, null, 2)}`); // Pretty print tasks

    // Step 2: Process each subtask concurrently
    const workerPromises = subTasks.map(async (taskInfo) => {
      const workerInput = this.formatPrompt(this.workerPrompt, {
        original_task: task,
        task_type: taskInfo.type,
        task_description: taskInfo.description,
        ...effectiveContext,
      });

      const workerResponse = await llmCall(workerInput);
      const result = extractXml(workerResponse, "response");

      console.log(`\n=== WORKER RESULT (${taskInfo.type}) ===\n${result}\n`);

      return {
        type: taskInfo.type,
        description: taskInfo.description,
        result: result,
      };
    });

    // Wait for all worker promises to resolve
    const workerResults = await Promise.all(workerPromises);

    return {
      analysis: analysis,
      worker_results: workerResults,
    };
  }
}

// Export the new functions/classes along with the existing ones
export {
  llmCall,
  extractXml,
  chain,
  parallel,
  route,
  generate,
  evaluate,
  loop,
  FlexibleOrchestrator
};
