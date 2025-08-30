export type UserRole =
  | 'Regulator'
  | 'Auditor'
  | 'Grower'
  | 'Shop'
  | 'Lab'
  | 'Operator'
  | 'Operator.Farmer'
  | 'Operator.Shop'
  | 'Operator.Lab';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

export interface HashEvent {
  type: 'plant' | 'harvest';
  id: string;
  timestamp: string;
  hash: string;
  [key: string]: any;
}
