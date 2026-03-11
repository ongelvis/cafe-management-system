import { RequestHandler, requestHandler } from 'mediatr-ts';
import { GetCafesQuery } from './GetCafesQuery';
import { pool } from '../../infra/Database';
import { Cafe } from '../../domain/Cafe';

@requestHandler(GetCafesQuery)
export class GetCafesHandler implements RequestHandler<GetCafesQuery, Cafe[]> {
    async handle(query: GetCafesQuery): Promise<Cafe[]> {
        let sql = `
            SELECT c.id, c.name, c.description, c.location, c.logo,
                   COUNT(ec.employee_id)::int AS employees
            FROM cafes c
            LEFT JOIN employee_cafe ec ON c.id = ec.cafe_id
        `;
        const params: any[] = [];

        if (query.location) {
            sql += ` WHERE c.location = $1`;
            params.push(query.location);
        }

        sql += ` GROUP BY c.id ORDER BY COUNT(ec.employee_id) DESC`;

        const { rows } = await pool.query(sql, params);
        return rows;
    }
}