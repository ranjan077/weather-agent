# Weather Agent

An AI-powered weather assistant that retrieves weather information and answers questions in natural language.

## Features

- Get current weather for a location
- Ask weather-related questions conversationally
## Requirements

- Node.js 18+
- npm
- An API key for the weather provider used by the application
- An API key for the configured AI provider, if required

## Setup

```bash
git clone <repository-url>
cd weather_agent
npm install
```

Create a `.env` file in the project root and add the credentials expected by the application, for example:

```env
WEATHER_API_KEY=your_weather_api_key
OPENAI_API_KEY=your_ai_provider_key
```

Do not commit `.env` or API keys to source control.

## Usage

Run the application with npm:

```bash
npm run start
```

Then enter a location or a natural-language question, such as:

```text
What is the weather in Seattle today?
```

## Configuration

Provider settings and model options can be configured through environment variables or the project configuration file. Refer to the source code for the exact variable names and available options.

## Development

Run the application directly with Node.js during development:

```bash
node index.js
```

Contributions are welcome. Keep changes focused, add tests for new behavior, and avoid exposing credentials.

## License

No license has been specified yet.
