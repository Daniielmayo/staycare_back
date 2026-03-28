import mysql from 'mysql2/promise';
import { config } from '../config/index';

const pool = mysql.createPool({
  host:               config.db.host,
  port:               config.db.port,
  user:               config.db.user,
  password:           config.db.password,
  database:           config.db.database,
  connectionLimit:    config.db.connectionLimit,
  waitForConnections: true,
  enableKeepAlive:    true,
  timezone:           'Z',            // fuerza UTC en todas las queries
  multipleStatements: false,          // prevención extra contra SQL injection
});

export default pool;