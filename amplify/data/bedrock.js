export function request(ctx) {
    const { ingredients = [] } = ctx.args;
  
    // Construct the prompt with the provided ingredients
    const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;
  
    // Return the request configuration
    return {
      resourcePath: `/model/amazon.nova-micro-v1:0/invoke`,
      method: "POST",
      params: {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inferenceConfig: {
            maxTokens: 1000,
          },
          messages: [
            {
              role: "user",
              content: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    };
  }
  
  export function response(ctx) {
    if (ctx.error) {
      return { error: ctx.error.message };
    }

    const result = ctx.result;
    const parsedBody = JSON.parse(result.body);

    if (result.statusCode < 200 || result.statusCode >= 300) {
      return {
        error: parsedBody.message || `Bedrock request failed with HTTP ${result.statusCode}.`,
      };
    }

    const output = parsedBody.output;
    const message = output && output.message;
    const content = message && message.content;
    const text = content && content.length > 0 && content[0].text;
    if (!text) {
      return {
        error: parsedBody.message || "Bedrock returned no text in its response.",
      };
    }

    return { body: text };
  }