// import "../src/config/env";
import app from "../src/app";
// import { connectDB } from "../src/config/db";

// NOTE: Este punto de entrada es específico para despliegues Serverless (como Vercel).
// El proyecto StayCare actualmente usa MySQL y no requiere este archivo para despliegues estándar.

/*
connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB", error);
});
*/

// Export the Express app as the default handler for the Vercel Node serverless function.
export default app;

