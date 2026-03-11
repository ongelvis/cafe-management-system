import { RequestHandler, requestHandler } from 'mediatr-ts';
import { GetEmployeesQuery } from './GetEmployeeQuery';
import { pool } from '../../infra/Database';
import { Employee } from '../../domain/Employee';

@requestHandler(GetEmployeesQuery)
export class GetEmployeesHandler implements RequestHandler<GetEmployeesQuery, Employee[]> {
    async handle(query: GetEmployeesQuery): Promise<Employee[]> {
        let sql = `
            SELECT e.id, e.name, e.email_address, e.phone_number, e.gender,
                   COALESCE((CURRENT_DATE - ec.start_date)::int, 0) AS days_worked,
                   c.name AS cafe
            FROM employees e
            LEFT JOIN employee_cafe ec ON e.id = ec.employee_id
            LEFT JOIN cafes c ON ec.cafe_id = c.id
        `;
        const params: any[] = [];

        if (query.cafeName) {
            sql += ` WHERE c.name = $1`;
            params.push(query.cafeName);
        }

        sql += ` ORDER BY days_worked DESC`;

        const { rows } = await pool.query(sql, params);
        return rows;
    }
}