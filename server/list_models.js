const fs = require('fs');

const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const models = [];
const lines = content.split('\n');
for (const line of lines) {
  if (line.trim().startsWith('model ')) {
    models.push(line.trim());
  }
}
console.log(models);
