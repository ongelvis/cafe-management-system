import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export interface Cafe {
  id: string;
  name: string;
  description: string;
  location: string;
  logo: string | null;
  employees: number;
}

export interface Employee {
  id: string;
  name: string;
  email_address: string;
  phone_number: string;
  gender: 'Male' | 'Female';
  days_worked: number;
  cafe: string | null;
}

export interface CafePayload {
  name: string;
  description: string;
  location: string;
  logo?: string | null;
}

// Cafes
export const getCafes = (location?: string) =>
  api.get<Cafe[]>('/cafes', { params: location ? { location } : {} }).then(r => r.data);

export const createCafe = (data: CafePayload) =>
  api.post<{ id: string }>('/cafes', data).then(r => r.data);

export const updateCafe = (id: string, data: CafePayload) =>
  api.put(`/cafes/${id}`, data).then(r => r.data);

export const deleteCafe = (id: string) =>
  api.delete(`/cafes/${id}`).then(r => r.data);

// Employees
export const getEmployees = (cafe?: string) =>
  api.get<Employee[]>('/employees', { params: cafe ? { cafe } : {} }).then(r => r.data);

export const createEmployee = (data: object) =>
  api.post<{ id: string }>('/employees', data).then(r => r.data);

export const updateEmployee = (data: object) =>
  api.put('/employees', data).then(r => r.data);

export const deleteEmployee = (id: string) =>
  api.delete(`/employees/${id}`).then(r => r.data);
