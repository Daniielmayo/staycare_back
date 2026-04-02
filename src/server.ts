import app from "./app";
import pool from "./db/pool";
import { config } from "./config";
import { autoInitDbForDevelopment } from "./db/bootstrapDev";

const PORT = config.app.port;

async function startServer() {
  try {
    await autoInitDbForDevelopment();

    const connection = await pool.getConnection();
    console.log("MySQL connected successfully");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error("MySQL startup failed:", error);
    if (error?.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "Access denied: el usuario/contraseña no coinciden con MySQL, o el usuario no existe. " +
          "Alinea DB_USER y DB_PASSWORD en .env con tu servidor MySQL local, o ejecuta scripts/mysql-local-grant.sql (como root) y usa la misma contraseña en .env.",
      );
    }
    process.exit(1);
  }
}

void startServer();