// Fix: Provided full implementation for the types used throughout the application.
// Fix: Added and exported GradeDetails type to be used across the application.
export interface GradeDetails {
  letter: string;
  point: number;
  color: string;
}
export interface Course {
  id: string;
  name: string;
  credits: number;
  score: number | null;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  ips: number | null;
}

export interface StudentProfile {
  name: string;
  nim: string;
  email: string;
  major: string;
  classYear: string;
  advisorName?: string;
  advisorNip?: string;
  transcriptPlaceAndDate?: string;
  role?: 'student' | 'admin';
}

export interface UserData {
  profile: StudentProfile;
  semesters: Semester[];
  password: string;
  lastAdminEdit?: string; // To log admin activity
}

export interface LoginEvent {
  name: string;
  email: string;
  timestamp: string;
  seen: boolean;
}

export interface RegistrationEvent {
  name: string;
  nim: string;
  email: string;
  timestamp: string;
}

export type AuthView = 'login' | 'register' | 'forgotPassword';

export type View = 'dashboard' | 'coursework' | 'reports' | 'profile';

export type AdminView = 'users' | 'analytics' | 'settings';

export interface AppSettings {
  gradeScale: { minScore: number; details: GradeDetails }[];
  targetSks: number;
}