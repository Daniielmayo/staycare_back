-- Ejecutar en MySQL Workbench como usuario con privilegios administrativos (p. ej. root).
-- Ajusta la contraseña para que coincida EXACTAMENTE con DB_PASSWORD en tu archivo .env.
--
-- MySQL trata por separado a 'usuario'@'localhost' y 'usuario'@'127.0.0.1'.
-- Si DB_HOST=127.0.0.1 en .env, hace falta la cuenta para 127.0.0.1 (y viceversa).

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS staycare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Cambia 'your_secure_password_here' por el mismo valor que DB_PASSWORD en .env
CREATE USER IF NOT EXISTS 'staycare_dev'@'localhost' IDENTIFIED BY 'your_secure_password_here';
CREATE USER IF NOT EXISTS 'staycare_dev'@'127.0.0.1' IDENTIFIED BY 'your_secure_password_here';

ALTER USER 'staycare_dev'@'localhost' IDENTIFIED BY 'your_secure_password_here';
ALTER USER 'staycare_dev'@'127.0.0.1' IDENTIFIED BY 'your_secure_password_here';

GRANT ALL PRIVILEGES ON staycare.* TO 'staycare_dev'@'localhost';
GRANT ALL PRIVILEGES ON staycare.* TO 'staycare_dev'@'127.0.0.1';

FLUSH PRIVILEGES;
