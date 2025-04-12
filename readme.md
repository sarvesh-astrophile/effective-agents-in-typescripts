# Agentic Workflow Playground (TypeScript + Gemini)

## Introduction

This playground demonstrates common agentic workflow patterns implemented purely in TypeScript, using the Google Gemini API directly via the `@google/genai` SDK. The examples cover sequential processing (chaining), concurrent execution (parallelization), dynamic task assignment (routing), iterative refinement (evaluation loops), and task decomposition (orchestrator-worker).

## Philosophy: Less Abstraction, More Control

While frameworks like Langchain.js or CrewAI offer powerful abstractions for building complex agents, for well-defined and common agentic patterns like those demonstrated here, directly utilizing an LLM SDK like `@google/genai` can offer significant advantages:

- **Transparency & Control**: The logic flow and API interactions are explicit and easier to follow. You have complete control over the prompts sent to the LLM and how responses are parsed, making debugging more straightforward.
- **Reliability**: Fewer layers of abstraction mean fewer potential points of failure or unexpected behaviors introduced by framework internals. Changes in the underlying SDK are easier to adapt to than potentially breaking changes cascaded through a large framework.
- **Reduced Dependencies**: A lighter footprint reduces the overall complexity and potential conflicts within your project. You are less susceptible to vulnerabilities or breaking changes introduced by the transitive dependencies of large libraries.
- **Performance**: Direct SDK calls can have lower overhead compared to frameworks that might manage complex internal state, chain configurations, or additional processing layers.

This approach prioritizes clarity and direct control for implementing established agentic patterns efficiently.

## Inspiration & Credit

The patterns and examples presented here are heavily inspired by and adapted from Anthropic's excellent engineering blog post: [**Building Effective Agents**](https://www.anthropic.com/engineering/building-effective-agents). Their insights into structuring LLM interactions form the foundation for these implementations.

## Key Files Description

- `utils.ts`: The core utility library containing the fundamental building blocks for the agentic patterns:
  - `llmCall`: The primary function for interacting with the Gemini API via `@google/genai`.
  - `extractXml`: A simple utility for parsing XML-like tags often used for structured LLM responses.
  - `chain`: Implements sequential LLM calls, passing the output of one step as input to the next.
  - `parallel`: Implements concurrent LLM calls with the same prompt applied to multiple inputs.
  - `route`: Implements LLM-based classification to route an input to the most appropriate specialized prompt.
  - `generate`, `evaluate`, `loop`: Together, these implement the generate-evaluate-refine pattern for iterative improvement of LLM outputs based on defined criteria.
  - `FlexibleOrchestrator`: A class implementing the orchestrator-worker pattern, where a central orchestrator LLM breaks down a task for multiple worker LLMs to execute.
- `basic-workflow/prompt-chaning.ts`: Demonstrates the `chain` function for sequential data processing or refinement tasks.
- `basic-workflow/parallelization.ts`: Demonstrates the `parallel` function, useful for tasks like analyzing an input from multiple perspectives concurrently (e.g., stakeholder analysis).
- `basic-workflow/routing.ts`: Shows how the `route` function can classify an input (like a support ticket) and direct it to a specialized handler or prompt.
- `evaluator-optimizer.ts`: Provides an example of the `loop` function, showcasing how to iteratively generate and evaluate solutions until a quality standard ("PASS") is met.
- `orchestrator-worker.ts`: Illustrates the `FlexibleOrchestrator` class breaking down a complex request into sub-tasks handled by specialized workers.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Bun (Install via `npm install -g bun` or see [official Bun installation guide](https://bun.sh/docs/installation))

### API Key Setup

1.  Create a file named `.env` in the **root directory of this project** (i.e., the parent directory of `src/`).
2.  Add your Google Gemini API key to the `.env` file:
    ```dotenv
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
    _Replace `"YOUR_API_KEY_HERE"` with your actual API key._

### Installation

Install the necessary dependencies using Bun:

```bash
bun install
```

### Running Examples

You can run each example script individually using Bun from the project root directory:

```bash
# Basic Workflow Examples
bun run src/playground/basic-workflow/prompt-chaning.ts
bun run src/playground/basic-workflow/parallelization.ts
bun run src/playground/basic-workflow/routing.ts

# Advanced Workflow Examples
bun run src/playground/evaluator-optimizer.ts
bun run src/playground/orchestrator-worker.ts
```
