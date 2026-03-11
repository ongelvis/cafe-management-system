import { RequestHandler, requestHandler } from 'mediatr-ts';
import { CreateEmployeeCommand } from './CreateEmployeeCommand';
import { pool } from '../../infra/Database';

@requestHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler implements RequestHandler<CreateEmployeeCommand, string> {
    // Helper to generate the 'UIXXXXXXX' format 
    private generateEmployeeId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'UI';
        for (let i = 0; i < 7; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async handle(command: CreateEmployeeCommand): Promise<string> {
        const employeeId = this.generateEmployeeId();
        const client = await pool.connect();

        try {
            await client.query('BEGIN'); // Start Transaction 

            // Insert into employees table
            const employeeQuery = `
                INSERT INTO employees (id, name, email_address, phone_number, gender)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(employeeQuery, [
                employeeId, 
                command.name, 
                command.email_address, 
                command.phone_number, 
                command.gender
            ]);

            // If a cafe_id is provided, create the relationship 
            if (command.cafe_id) {
                const relationshipQuery = `
                    INSERT INTO employee_cafe (employee_id, cafe_id, start_date)
                    VALUES ($1, $2, CURRENT_DATE)
                `;
                await client.query(relationshipQuery, [employeeId, command.cafe_id]);
            }

            await client.query('COMMIT');
            return employeeId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}