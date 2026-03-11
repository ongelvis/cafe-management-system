import { RequestHandler, requestHandler } from 'mediatr-ts';
import { DeleteCafeCommand } from './DeleteCafeCommand';
import { pool } from '../../infra/Database';

@requestHandler(DeleteCafeCommand)
export class DeleteCafeHandler implements RequestHandler<DeleteCafeCommand, void> {
    async handle(command: DeleteCafeCommand): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Transaction for data integrity

            // 1. Requirement: Delete all employees under the deleted cafe 
            // We find employees linked to this cafe and delete them from the employees table
            const deleteEmployeesSql = `
                DELETE FROM employees 
                WHERE id IN (
                    SELECT employee_id FROM employee_cafe WHERE cafe_id = $1
                )
            `;
            await client.query(deleteEmployeesSql, [command.id]);

            // 2. Delete the cafe itself
            // Note: The employee_cafe junction records will auto-delete due to FK CASCADE
            await client.query('DELETE FROM cafes WHERE id = $1', [command.id]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}