import { Router } from 'express';
import { Mediator } from 'mediatr-ts';
import { GetCafesQuery } from '../application/queries/GetCafesQuery';
import { GetEmployeesQuery } from '../application/queries/GetEmployeeQuery';
import { CreateCafeCommand } from '../application/commands/CreateCafeCommand';
import { CreateEmployeeCommand } from '../application/commands/CreateEmployeeCommand';
import { UpdateCafeCommand } from '../application/commands/UpdateCafeCommand';
import { UpdateEmployeeCommand } from '../application/commands/UpdateEmployeeCommand';
import { DeleteCafeCommand } from '../application/commands/DeleteCafeCommand';
import { DeleteEmployeeCommand } from '../application/commands/DeleteEmployeeCommand';

const router = Router();
const mediator = new Mediator();

// --- CAFE ENDPOINTS ---

// GET /cafes?location=<location>
router.get('/cafes', async (req, res) => {
    const query = new GetCafesQuery(req.query.location as string);
    const result = await mediator.send(query);
    res.json(result); // Sorted by highest employees first
});

// POST /cafes
router.post('/cafes', async (req, res) => {
    const logo = req.body.logo ? Buffer.from(req.body.logo, 'base64') : undefined;
    const command = new CreateCafeCommand(req.body.name, req.body.description, req.body.location, logo);
    const id = await mediator.send(command);
    res.status(201).json({ id });
});

// PUT /cafes
router.put('/cafes/:id', async (req, res) => {
    const logo = req.body.logo ? Buffer.from(req.body.logo, 'base64') : undefined;
    const command = new UpdateCafeCommand(req.params.id, req.body.name, req.body.description, req.body.location, logo);
    await mediator.send(command);
    res.sendStatus(204);
});

// DELETE /cafes 
router.delete('/cafes/:id', async (req, res) => {
    const command = new DeleteCafeCommand(req.params.id);
    await mediator.send(command);
    res.sendStatus(204);
});

// --- EMPLOYEE ENDPOINTS ---

// GET /employees?cafe=<cafeName>
router.get('/employees', async (req, res) => {
    const query = new GetEmployeesQuery(req.query.cafe as string);
    const result = await mediator.send(query);
    res.json(result); // Sorted by highest days worked
});

// POST /employees
router.post('/employees', async (req, res) => {
    const { name, email_address, phone_number, gender, cafe_id } = req.body;
    const command = new CreateEmployeeCommand(name, email_address, phone_number, gender, cafe_id);
    const id = await mediator.send(command);
    res.status(201).json({ id });
});

// PUT /employees
router.put('/employees', async (req, res) => {
    try {
        const { id, name, email_address, phone_number, gender, cafe_id } = req.body;
        const command = new UpdateEmployeeCommand(id, name, email_address, phone_number, gender, cafe_id);
        await mediator.send(command);
        res.sendStatus(204);
    } catch (err: any) {
        if (err.message && err.message.includes('not found')) {
            res.status(404).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// DELETE /employees
router.delete('/employees/:id', async (req, res) => {
    const command = new DeleteEmployeeCommand(req.params.id);
    await mediator.send(command);
    res.sendStatus(204);
});

export default router;