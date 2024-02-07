const pg = require('pg');
const config = require('../build/db/config');

const { argv } = process;

if (argv.length < 3) {
	console.error('usage: node rollback.js <migration-name>');
	process.exit(1);
}

const client = new pg.Client(config);

function migrationHasRun(migration) {
	return client.query('SELECT name FROM migrations WHERE name = $1', [migration])
		.then(result => {
			return result.rows.length > 0;
		});
}

function removeMigrationFromTable(migration) {
	return client.query('DELETE FROM migrations WHERE name = $1', [migration]);
}

async function rollbackMigration(migration) {
	const Migration = require(`../migrations/${migration}.js`);
	const migrationInstance = new Migration();
	await migrationInstance.down(client);
}

async function rollback() {
	const migration = argv[2];
	await client.query('BEGIN');
	try {
		const hasRun = await migrationHasRun(migration);
		if (!hasRun) {
			console.error(`Migration ${migration} has not run`);
			process.exit(1);
		}
		console.log(`Rolling back ${migration}`);
		await rollbackMigration(migration);
		await removeMigrationFromTable(migration);
		await client.query('COMMIT');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error(`error rolling back ${migration}`, err);
	} finally {
		await client.end();
	}
}

client.connect()
	.then(rollback)
	.catch(err => {
		console.error('error connecting to database', err);
	});