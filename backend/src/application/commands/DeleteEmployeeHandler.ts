import { RequestHandler, requestHandler } from 'mediatr-ts';
import { DeleteEmployeeCommand } from './DeleteEmployeeCommand';
import { pool } from '../../infra/Database';

@requestHandler(DeleteEmployeeCommand)
export class DeleteEmployeeHandler implements RequestHandler<DeleteEmployeeCommand, void> {
    async handle(command: DeleteEmployeeCommand): Promise<void> {
        await pool.query('DELETE FROM employees WHERE id = $1', [command.id]);
    }
}