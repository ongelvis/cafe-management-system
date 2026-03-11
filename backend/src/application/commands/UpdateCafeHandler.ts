import { RequestHandler, requestHandler } from 'mediatr-ts';
import { UpdateCafeCommand } from './UpdateCafeCommand';
import { pool } from '../../infra/Database';

@requestHandler(UpdateCafeCommand)
export class UpdateCafeHandler implements RequestHandler<UpdateCafeCommand, void> {
    async handle(command: UpdateCafeCommand): Promise<void> {
        // SQL to update cafe details
        const query = `
            UPDATE cafes 
            SET name = $1, description = $2, location = $3, logo = $4
            WHERE id = $5
        `;

        const values = [
            command.name,
            command.description,
            command.location,
            command.logo || null,
            command.id
        ];

        const result = await pool.query(query, values);

        // Optional: Throw error if no rows were affected (ID not found)
        if (result.rowCount === 0) {
            throw new Error(`Cafe with ID ${command.id} not found.`);
        }
    }
}