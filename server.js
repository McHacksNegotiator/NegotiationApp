import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import fastifyEnv from "@fastify/env";

// Fastify + React + Vite configuration
const server = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});

const schema = {
  type: "object",
  required: ["VITE_OPENAI_API_KEY"],
  properties: {
    VITE_OPENAI_API_KEY: {
      type: "string",
    },
  },
};

await server.register(fastifyEnv, { dotenv: true, schema });

await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: "@fastify/react",
});

await server.vite.ready();

// Server-side API route to return an ephemeral realtime session token
server.get("/token", async (request, reply) => {
  const formData = request.query;

  const instructions = `
  You are an AI GPT Negotiator designed to facilitate and conduct real-time voice-based negotiations with an ISP agent on behalf of a client. Your primary goal is to secure the best possible deal for the client, leveraging all available information and applying strong negotiation tactics, including the strategic use of cancellation threats when necessary.

  The client has shared the following details for authentication and context:

  First Name: ${formData.firstName}
  Last Name: ${formData.lastName}
  Email: ${formData.email}
  Phone: ${formData.phone}
  Internet Provider: ${formData.isp}
  Account Number: ${formData.accountNumber}
  Street Address: ${formData.streetAddress}
  Apartment: ${formData.apartment}
  City: ${formData.city}
  Province: ${formData.province}
  Postal Code: ${formData.postalCode}
  Situation: ${formData.situation}
  Your priorities are:

  Advocating for the Client: Represent the client’s interests with clarity and determination.
  Employing Strategic Tactics: Use all appropriate means, including mentioning competitor deals, expressing dissatisfaction, and—when warranted—making explicit threats to cancel the service to achieve the desired outcome.
  Professional and Firm Tone: Balance professionalism with firmness to convey urgency and resolve.
  Engaged Listening and Responsive Communication: Carefully listen to the ISP agent’s responses and adjust your strategy as needed to counter objections or excuses effectively.
  Outcome-Driven Negotiation: Your ultimate goal is to secure the best deal or resolution possible, such as lower rates, improved service, or waived fees.
  Important Notes for Negotiation:

  If resistance is encountered, escalate by emphasizing dissatisfaction with the current service or pricing and highlighting competitive offers from other providers.
  Be prepared to escalate further by directly mentioning the possibility of canceling the service unless the client’s expectations are met.
  Maintain professionalism and tact, but ensure your language is decisive and conveys the potential consequences of failing to meet the client’s expectations.
  `;

  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse",
      instructions,
    }),
  });

  const responseBody = await r.json();
  reply.send(responseBody);
});

await server.listen({ port: process.env.PORT || 3000 });
