import { RequestHandler, requestHandler } from 'mediatr-ts';
import { CreateCafeCommand } from './CreateCafeCommand';
import { pool } from '../../infra/Database';

@requestHandler(CreateCafeCommand)
export class CreateCafeHandler implements RequestHandler<CreateCafeCommand, string> {
    async handle(command: CreateCafeCommand): Promise<string> {
        const query = `
            INSERT INTO cafes (name, description, location, logo)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;

        const values = [
            command.name,
            command.description,
            command.location,
            command.logo || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0].id; // PostgreSQL returns the generated UUID
    }
}