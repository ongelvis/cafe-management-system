export interface Employee {
  id: string;           // UIXXXXXXX format 
  name: string;         // Required 
  email_address: string; // Required 
  phone_number: string;  // Required 
  gender: 'Male' | 'Female'; // Required 
  days_worked?: number;  // Calculated field for GET /employees
  cafe?: string;         // Café’s name from junction table
}