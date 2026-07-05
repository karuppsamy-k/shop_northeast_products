export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role?: "admin" | "user";
  orders?: string[]; // Order IDs
  cart?: any[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
