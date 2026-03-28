const bcrypt = require('bcryptjs');

const hash = '$2a$10$6pZ070VbU4Ywz0fM3y3Eoe7m2uX7.G8R3J/zY70l7y8z.U7R6P.u6';
const passwords = ['password123', 'admin123', 'staycare123', '123456'];

passwords.forEach(pw => {
  const match = bcrypt.compareSync(pw, hash);
  console.log(`Password "${pw}": ${match ? 'MATCH' : 'NO MATCH'}`);
});

bcrypt.hash('password123', 10).then(newHash => {
  console.log(`New hash for "password123": ${newHash}`);
});
