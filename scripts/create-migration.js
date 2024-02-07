const { writeFileSync } = require('fs');

const { argv } = process;

if (argv.length < 3) {
  console.error('usage: node create-migration.js <migration-name>');
  process.exit(1);
}

const migrationName = argv[2].replaceAll('-', '_')
    .replaceAll(' ', '_');
const now = new Date();

const migrationTemplate = `
class ${migrationName} {
    identifier = '${now.valueOf()}-${migrationName}';

	async up(runner) {
		// write your migration here
  	}

  	async down(runner) {
		// write your rollback here
  	}
}

module.exports = ${migrationName};
`;

writeFileSync(`migrations/${now.valueOf()}-${migrationName}.js`, migrationTemplate);

console.log(`Created migration: migrations/${now.valueOf()}-${migrationName}.js`);