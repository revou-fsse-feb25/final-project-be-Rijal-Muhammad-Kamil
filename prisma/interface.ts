import { Role,  Gender, UserStatus } from "@prisma/client";

export interface AttendeeUser {
  user_id: number;
  email: string;
  password: string;
  role: Role;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  phone_number: string;
  status: UserStatus;
}

export interface OrganizerUser {
  user: {
    user_id: number;
    email: string;
    password: string;
    role: Role;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: Gender;
    phone_number: string;
    status: UserStatus;
  };
  organizer: {
    organizer_id: number;
    user_id: number;
    name: string;
    logo_url: string | null;
  };
}
