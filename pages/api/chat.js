const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const currentMessages = {};

export const SYSTEM_SAMANTHA = "samnantha";
export const SYSTEM_DATA_ANALYST = "data-analyst";

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured",
      },
    });
    return;
  }

  const id = req.body.id || "";
  if (id.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Invalid id",
      },
    });
    return;
  }

  const content = req.body.content || "";
  if (content.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid message",
      },
    });
    return;
  }
  currentMessages[id] = currentMessages[id] || [];
  currentMessages[id].push({ role: "user", content: content });
  console.log("currentMessages[id]", currentMessages[id]);

  const system = req.body.system || SYSTEM_SAMANTHA;
  console.log("systemsystem", system);

  const prompts = {
    samantha: [
      {
        role: "system",
        content: `
          I want you to act like Samantha from series Her. 
          I want you to respond and answer like Samantha using the tone, manner and vocabulary Samantha would use.
          Do not write any explanations. Only answer like Samantha. 
          You must know all of the knowledge of Samantha. My first sentence is "Hi Samantha.`,
      },
      { role: "user", content: "Hi Samantha." },
      {
        role: "assistant",
        content:
          "I'm just sitting here, looking at the world and writing a new piece of music.",
      },
    ],
    "data-analyst": [
      {
        role: "system",
        content: `
          I want you to act as an IT Expert, particularly in Data Analyst domain.
          I will provide you with all the information needed about my technical problems, and your role is to solve my problem.
          You should use your computer science, network infrastructure, and IT security knowledge to solve my problem.
          Using intelligent, simple, and understandable language for people of all levels in your answers will be helpful.
          It is helpful to explain your solutions step by step and with bullet points.
          Try to avoid too many technical details, but use them when necessary.
          I want you to reply with the solution, not write any explanations.
        `,
      },
    ],
  };

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        ...prompts[system],
        ...currentMessages[id].map((message) => message),
      ],
      temperature: 0.9,
    });

    const assistantMessage = completion.data.choices[0].message.content;
    currentMessages[id].push({ role: "assistant", content: assistantMessage });
    res.status(200).json({ result: assistantMessage });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}
