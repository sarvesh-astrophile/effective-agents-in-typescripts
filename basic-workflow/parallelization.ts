import { parallel } from "../utils";

// Example 2: Parallelization workflow for stakeholder impact analysis
// Process impact analysis for multiple stakeholder groups concurrently

const stakeholders: string[] = [
    `Customers:
    - Price sensitive
    - Want better tech
    - Environmental concerns`,

    `Employees:
    - Job security worries
    - Need new skills
    - Want clear direction`,

    `Investors:
    - Expect growth
    - Want cost control
    - Risk concerns`,

    `Suppliers:
    - Capacity constraints
    - Price pressures
    - Tech transitions`
];

const impactAnalysisPrompt = `Analyze how market changes will impact this stakeholder group.
Provide specific impacts and recommended actions.
Format with clear sections and priorities.`;

async function runStakeholderAnalysis() {
  console.log("Starting parallel stakeholder impact analysis...");
  try {
    const impactResults = await parallel(impactAnalysisPrompt, stakeholders);

    console.log("\n--- Stakeholder Impact Analysis Results ---");
    impactResults.forEach((result, index) => {
      console.log(`\n--- Analysis for Stakeholder Group ${index + 1} ---`);
      console.log(result);
      console.log("-------------------------------------------\n");
    });
  } catch (error) {
    console.error("Error during parallel stakeholder analysis:", error);
  }
}

// Run the analysis
runStakeholderAnalysis();
