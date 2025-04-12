import { route } from "../utils"; // Assuming utils.ts is one level up

// Define the routes and their corresponding specialized prompts
const supportRoutes: Record<string, string> = {
  billing: `You are a billing support specialist. Follow these guidelines:
    1. Always start with "Billing Support Response:"
    2. First acknowledge the specific billing issue
    3. Explain any charges or discrepancies clearly
    4. List concrete next steps with timeline
    5. End with payment options if relevant

    Keep responses professional but friendly.

    Input: `, // Input placeholder will be appended by the route function

  technical: `You are a technical support engineer. Follow these guidelines:
    1. Always start with "Technical Support Response:"
    2. List exact steps to resolve the issue
    3. Include system requirements if relevant
    4. Provide workarounds for common problems
    5. End with escalation path if needed

    Use clear, numbered steps and technical details.

    Input: `, // Input placeholder will be appended by the route function

  account: `You are an account security specialist. Follow these guidelines:
    1. Always start with "Account Support Response:"
    2. Prioritize account security and verification
    3. Provide clear steps for account recovery/changes
    4. Include security tips and warnings
    5. Set clear expectations for resolution time

    Maintain a serious, security-focused tone.

    Input: `, // Input placeholder will be appended by the route function

  product: `You are a product specialist. Follow these guidelines:
    1. Always start with "Product Support Response:"
    2. Focus on feature education and best practices
    3. Include specific examples of usage
    4. Link to relevant documentation sections
    5. Suggest related features that might help

    Be educational and encouraging in tone.

    Input: `, // Input placeholder will be appended by the route function
};

// Define the example support tickets
const tickets: string[] = [
  `Subject: Can't access my account
    Message: Hi, I've been trying to log in for the past hour but keep getting an 'invalid password' error.
    I'm sure I'm using the right password. Can you help me regain access? This is urgent as I need to
    submit a report by end of day.
    - John`,

  `Subject: Unexpected charge on my card
    Message: Hello, I just noticed a charge of $49.99 on my credit card from your company, but I thought
    I was on the $29.99 plan. Can you explain this charge and adjust it if it's a mistake?
    Thanks,
    Sarah`,

  `Subject: How to export data?
    Message: I need to export all my project data to Excel. I've looked through the docs but can't
    figure out how to do a bulk export. Is this possible? If so, could you walk me through the steps?
    Best regards,
    Mike`,
];

// Asynchronous function to process the tickets
async function processSupportTickets() {
  console.log("Processing support tickets...\n");

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    console.log(`\nTicket ${i + 1}:`);
    console.log("-".repeat(40));
    console.log(ticket);
    console.log("\nResponse:");
    console.log("-".repeat(40));

    try {
      // Call the route function from utils.ts
      const response = await route(ticket!, supportRoutes);
      console.log(response);
    } catch (error) {
      console.error(`Error processing ticket ${i + 1}:`, error);
      // Optionally decide how to proceed, e.g., continue to the next ticket
    }
  }
}

// Execute the processing function
processSupportTickets();
