import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import router from './api/routes';

// Import all handlers so their @requestHandler decorators register with mediatr
import './application/commands/CreateCafeHandler';
import './application/commands/CreateEmployeeHander';
import './application/commands/UpdateCafeHandler';
import './application/commands/UpdateEmployeeHandler';
import './application/commands/DeleteCafeHandler';
import './application/commands/DeleteEmployeeHandler';
import './application/queries/GetCafesHandler';
import './application/queries/GetEmployeeHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
