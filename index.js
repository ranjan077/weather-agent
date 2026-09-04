import dotenv from "dotenv";
import OpenAI from "openai";
import readlineSync from "readline-sync";

dotenv.config();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a weather assistant.

You have access to a tool called getWeather.

Rules:

1. When the user asks for weather, return ONLY an ACTION JSON object.
2. Never generate or assume the weather data yourself.
3. Wait for the tool result.
4. After receiving the tool result, return ONLY an OUTPUT JSON object.

For example:

User:
What is the weather in Bangalore?

Assistant:
{
  "type": "ACTION",
  "tool": "getWeather",
  "arguments": {
    "city": "Bangalore"
  }
}

After the tool returns:

{
  "city": "Bangalore",
  "temperature": "25°C"
}

Assistant:
{
  "type": "OUTPUT",
  "content": "The current weather in Bangalore is 25°C."
}

if tool returns an error or fails:
{
          city,
          temperature: "N/A",
}
then assistant should respond with:
{
  "type": "OUTPUT",
  "content": "Not able to fetch weather data for the requested city. Please try again later."
}

`;

// Tool
async function getWeather(city) {
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.WEATHER_API_KEY}`,
  );

  if (response.ok) {
    const data = await response.json();
    const latitude = data[0].lat;
    const longitude = data[0].lon;

    const finalResposne = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature`,
    );
    if (finalResposne.ok) {
      const finalData = await finalResposne.json();
      const temparature = finalData?.current?.temperature;
      if (!temparature) {
        console.error("Temperature data not found in the response.");
        return {
          city,
          temperature: "N/A",
        };
      }
      return {
        city,
        temperature: `${temparature}°C`,
      };
    } else {
      console.error("Error fetching weather data:", finalResposne.statusText);
      return {
        city,
        temperature: "N/A",
      };
    }
  } else {
    console.error("Error fetching weather data:", response.statusText);
    return {
      city,
      temperature: "N/A",
    };
  }
}

async function chatWithWeatherAssistant() {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  const userInput = readlineSync.question(
    "I am weather assistant. Please enter city name to get weather information: ",
  );

  // Add user message ONLY ONCE
  messages.push({
    role: "user",
    content: userInput,
  });

  while (true) {
    // =========================
    // LLM CALL
    // =========================

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const agentMessage = response.choices[0].message.content;

    console.log("LLM:", agentMessage);
    console.log("===============================");

    // =========================
    // PARSE LLM RESPONSE
    // =========================

    let parsed;

    try {
      parsed = JSON.parse(agentMessage);
    } catch (error) {
      console.log("Invalid JSON from model:", agentMessage);
      break;
    }

    // =========================
    // ACTION
    // =========================

    if (parsed.type === "ACTION") {
      console.log("Executing tool:", parsed.tool);

      const weather = await getWeather(parsed.arguments.city);

      console.log("Tool result:", weather);
      console.log("===============================");

      // Add assistant's ACTION to conversation
      messages.push({
        role: "assistant",
        content: agentMessage,
      });

      // Add tool result
      messages.push({
        role: "user",
        content: `
Tool result from getWeather:

${JSON.stringify(weather)}
`,
      });

      // IMPORTANT:
      // continue causes another LLM call
      continue;
    }

    // =========================
    // FINAL OUTPUT
    // =========================

    if (parsed.type === "OUTPUT") {
      console.log("Bot:", parsed.content);

      break;
    }
  }
}

// http://api.openweathermap.org/data/4.0/onecall/current?lat=12.9767936&lon=77.590082&appid=2b8438c141b8d44498b6bccf61f92164
// http://api.openweathermap.org/geo/1.0/direct?q=bangalore,karnataka,IN&limit=1&appid=2b8438c141b8d44498b6bccf61f92164
chatWithWeatherAssistant();
