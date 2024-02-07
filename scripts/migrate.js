const pg = require('pg');
const { readdirSync } = require('fs');
const config = require('../build/db/config');

const client = new pg.Client(config);

function migrationTableExists() {
	return client.query(`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_name = 'migrations'
		);
	`)
	.then(result => {
		return result.rows[0].exists;
	});
}

async function createMigrationTableIfNotExists() {
	// check if migrations table exists
	try {
		const exists = await migrationTableExists();
		if (exists) {
			console.log('migrations table exists');
		} else {
			await client.query(`
				CREATE TABLE migrations (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);
			`);
		}
	} catch (err) {
		console.error('error checking if migrations table exists', err);
	}
}

async function getPreviouslyRanMigrations() {
	const { rows } = await client.query('SELECT name FROM migrations');
	return rows.map(row => row.name);
}

async function getMigrationsToRun(previousMigrations) {
	const files = readdirSync('./migrations');
	const migrations = files.map(file => {
		const name = file.split('.')[0];
		return {
			name,
			file,
			alreadyRan: previousMigrations.includes(name)
		};
	});
	return migrations.filter(migration => !migration.alreadyRan);
}

async function runMigration(migration) {
	const { name, file } = migration;
	const migrationModule = require(`../migrations/${file}`);
	const instance = new migrationModule();
	await instance.up(client);
	await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
	console.log(`Ran migration: ${name}`);
}

async function runMigrations() {
	const previousMigrations = await getPreviouslyRanMigrations();
	const migrationsToRun = await getMigrationsToRun(previousMigrations);

	if (migrationsToRun.length === 0) {
		console.log('No migrations to run');
		client.end();
		return;
	}

	try {
		for (const migration of migrationsToRun) {
			await client.query('BEGIN');
			await runMigration(migration);
			await client.query('COMMIT');
		}
	} catch (err) {
		console.error('Error running migrations', err);
		client.query('ROLLBACK');
	} finally {
		client.end();
	}
}

client.connect()
	.then(async () => {
		await createMigrationTableIfNotExists();
		await runMigrations();
	})
	.catch(err => {
		console.error('Error connecting to database', err);
		process.exit(1);
	});