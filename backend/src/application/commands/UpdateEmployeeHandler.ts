import { RequestHandler, requestHandler } from 'mediatr-ts';
import { UpdateEmployeeCommand } from './UpdateEmployeeCommand';
import { pool } from '../../infra/Database';

@requestHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler implements RequestHandler<UpdateEmployeeCommand, void> {
    async handle(command: UpdateEmployeeCommand): Promise<void> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            
            // 1. Update basic employee details
            const updateEmployeeSql = `
                UPDATE employees 
                SET name = $1, email_address = $2, phone_number = $3, gender = $4
                WHERE id = $5
            `;
            const result = await client.query(updateEmployeeSql, [
                command.name, command.email_address, command.phone_number, command.gender, command.id
            ]);

            if (result.rowCount === 0) {
                throw new Error(`Employee with id ${command.id} not found`);
            }

            // 2. Handle Cafe Reassignment
            if (command.cafe_id) {
                const updateRelationshipSql = `
                    INSERT INTO employee_cafe (employee_id, cafe_id, start_date)
                    VALUES ($1, $2, CURRENT_DATE)
                    ON CONFLICT (employee_id) 
                    DO UPDATE SET cafe_id = EXCLUDED.cafe_id;
                `;
                await client.query(updateRelationshipSql, [command.id, command.cafe_id]);
            } else {
                // If no cafe_id is provided, we remove the relationship
                await client.query('DELETE FROM employee_cafe WHERE employee_id = $1', [command.id]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}