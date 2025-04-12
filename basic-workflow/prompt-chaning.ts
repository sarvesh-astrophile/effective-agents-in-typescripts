import { chain } from '../utils'; // Adjust the import path if needed

// Example 1: Chain workflow for structured data extraction and formatting
// Each step progressively transforms raw text into a formatted table

const dataProcessingSteps: string[] = [
  `Extract only the numerical values and their associated metrics from the text.
  Format each as 'value: metric' on a new line.
  Example format:
  92: customer satisfaction
  45%: revenue growth`,

  `Convert all numerical values to percentages where possible.
  If not a percentage or points, convert to decimal (e.g., 92 points -> 92%).
  Keep one number per line.
  Example format:
  92%: customer satisfaction
  45%: revenue growth`,

  `Sort all lines in descending order by numerical value.
  Keep the format 'value: metric' on each line.
  Example:
  92%: customer satisfaction
  87%: employee satisfaction`,

  `Format the sorted data as a markdown table with columns:
  | Metric | Value |
  |:--|--:|
  | Customer Satisfaction | 92% |`
];

const report: string = `
Q3 Performance Summary:
Our customer satisfaction score rose to 92 points this quarter.
Revenue grew by 45% compared to last year.
Market share is now at 23% in our primary market.
Customer churn decreased to 5% from 8%.
New user acquisition cost is $43 per user.
Product adoption rate increased to 78%.
Employee satisfaction is at 87 points.
Operating margin improved to 34%.
`;

// Use an async IIFE to run the chain function
(async () => {
  try {
    console.log("\nInput text:");
    console.log(report);

    console.log("\nProcessing steps:");
    dataProcessingSteps.forEach((step, index) => {
        console.log(`Step ${index + 1}:\n${step}\n`);
    });

    console.log("\nExecuting chain...\n");
    const formattedResult = await chain(report, dataProcessingSteps);

    console.log("\nFormatted Result:");
    console.log(formattedResult);
  } catch (error) {
    console.error("Error during chain execution:", error);
  }
})();
