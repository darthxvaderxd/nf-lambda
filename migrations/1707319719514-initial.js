const { hash } = require('../build/db/hash');

class initial {
    identifier = '1707319719514-initial';

	async up(runner) {
		// create roles table
		runner.query(`
			CREATE TABLE roles (
				id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
				name VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				enabled BOOLEAN DEFAULT TRUE
			);
		`);

		// create users table
		runner.query(`
			CREATE TABLE users (
				id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
				username VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL,
				password VARCHAR(255) NOT NULL,
				role_id uuid NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				enabled BOOLEAN DEFAULT TRUE,
				FOREIGN KEY (role_id) REFERENCES roles(id)
			);
		`);

		// create lambda table
		runner.query(`
			CREATE TABLE lambda (
				id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
				name VARCHAR(255) NOT NULL,
				description TEXT,
				dockerfile TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				enabled BOOLEAN DEFAULT TRUE,
				created_by uuid NOT NULL,
				FOREIGN KEY (created_by) REFERENCES users(id)
			);
		`);

		// create lambda_executions table
		runner.query(`
			CREATE TABLE lambda_executions (
				id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
				lambda_id uuid NOT NULL,
				status VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				enabled BOOLEAN DEFAULT TRUE,
				result TEXT,
				FOREIGN KEY (lambda_id) REFERENCES lambda(id)
			);
		`);

		// insert default roles
		runner.query(`
			INSERT INTO roles 
				(id, name) 
			VALUES (
				'00000000-0000-0000-0000-000000000001',
				'admin'
			);
		`);

		runner.query(`
			INSERT INTO roles (name) VALUES ('user');
		`);

		// insert default admin user
		runner.query(`
			INSERT INTO users 
				(username, email, password, role_id) 
			VALUES (
				'admin',
				'admin@localhost.com',
				'${await hash('password')}',
				'00000000-0000-0000-0000-000000000001'
			);
		`);

  	}

  	async down(runner) {
		// write your rollback
		runner.query('DROP TABLE lambda_executions');
		runner.query('DROP TABLE lambda');
		runner.query('DROP TABLE users');
		runner.query('DROP TABLE roles');
  	}
}

module.exports = initial;
