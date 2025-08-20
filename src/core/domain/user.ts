export type UserRole = 'student' | 'mentor' | 'admin';

export type User = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  timezone?: string;
  locale?: string;
};

// MVP convenience aliases
export type Student = User & { role: 'student' };
export type Mentor = User & { role: 'mentor' };

export const isStudent = (u?: User): u is Student => !!u && u.role === 'student';
export const isMentor = (u?: User): u is Mentor => !!u && u.role === 'mentor';



