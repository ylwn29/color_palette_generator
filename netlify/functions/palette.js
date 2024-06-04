const { Builder } = require('@netlify/functions');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const client = new OpenAI(process.env.OPENAI_API_KEY);

async function getColors(msg) {
  const prompt = `
    You are a color palette generating assistant that responds to text prompts for color palettes.
    Your should generate color palettes that fit the theme, mood, or instructions in the prompt.
    The palettes should be between 2 and 8 colors.

    Q: Convert the following verbal description of a color palette into a list of colors: The Mediterranean Sea
    A: ["#006699", "#66CCCC", "#F0E68C", "#008000", "#F08080"]

    Q: Convert the following verbal description of a color palette into a list of colors: sage, nature, earth
    A: ["#EDF1D6", "#9DC08B", "#609966", "#40513B"]

    Desired Format: a JSON array of hexadecimal color codes

    Q: Convert the following verbal description of a color palette into a list of colors: ${msg}
    A:
  `;

  const response = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
    max_tokens: 200,
  });

  return JSON.parse(response.choices[0].message.content);
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const { query } = new URLSearchParams(event.body);
    const colors = await getColors(query);
    return {
      statusCode: 200,
      body: JSON.stringify({ colors }),
    };
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
