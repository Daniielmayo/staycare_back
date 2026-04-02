#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = String(process.env.NODE_ENV || "development").toLowerCase();
if (env !== "development") {
  console.error("This script is development-only. Set NODE_ENV=development.");
  process.exit(1);
}

const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error("Missing DB config in .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)");
  process.exit(1);
}

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, "``")}\``;
}

function normalizeSchemaSql(sql, dbName) {
  const quotedDb = quoteIdentifier(dbName);
  return sql
    .replace(/`staycare`/g, quotedDb)
    .replace(/CREATE SCHEMA IF NOT EXISTS\s+`[^`]+`/i, `CREATE SCHEMA IF NOT EXISTS ${quotedDb}`)
    .replace(/USE\s+`[^`]+`\s*;/i, `USE ${quotedDb};`);
}

function splitSchemaAndSeed(sql) {
  const marker = "-- Seed Data:";
  const index = sql.indexOf(marker);
  if (index === -1) {
    return { schemaSql: sql, seedSql: "" };
  }
  return {
    schemaSql: sql.slice(0, index),
    seedSql: sql.slice(index),
  };
}

async function createDatabase(connection) {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`Database ensured: ${DB_NAME}`);
}

async function runSchema(connection) {
  const schemaPath = path.resolve(process.cwd(), "docs/migration/staycare_mysql.sql");
  const raw = await fs.readFile(schemaPath, "utf8");
  const { schemaSql } = splitSchemaAndSeed(raw);
  const normalized = normalizeSchemaSql(schemaSql, DB_NAME);
  await connection.query(normalized);
  console.log("Schema applied");
}

async function runSeed(connection) {
  const schemaPath = path.resolve(process.cwd(), "docs/migration/staycare_mysql.sql");
  const raw = await fs.readFile(schemaPath, "utf8");
  const { seedSql } = splitSchemaAndSeed(raw);
  if (!seedSql.trim()) {
    console.log("No seed section found in SQL file");
    return;
  }
  const normalizedSeed = `USE ${quoteIdentifier(DB_NAME)};\n${normalizeSchemaSql(seedSql, DB_NAME)}`;
  await connection.query(normalizedSeed);
  console.log("Seed applied");
}

async function main() {
  const action = (process.argv[2] || "").trim().toLowerCase();
  if (!["create", "schema", "seed", "bootstrap"].includes(action)) {
    console.error("Usage: node scripts/dev-db.js <create|schema|seed|bootstrap>");
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    if (action === "create" || action === "bootstrap") {
      await createDatabase(connection);
    }
    if (action === "schema" || action === "bootstrap") {
      await runSchema(connection);
    }
    if (action === "seed" || action === "bootstrap") {
      await runSeed(connection);
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("DB script failed:", error?.message || error);
  process.exit(1);
});
