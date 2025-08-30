// User service interfaces and implementations
interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

type UserRole = 'admin' | 'user' | 'guest';

interface UserService {
    findById(id: string): Promise<User | null>;
    create(user: Omit<User, 'id'>): Promise<User>;
    update(user: User): Promise<void>;
    delete(id: string): Promise<void>;
}

class UserServiceImpl implements UserService {
    private users: Map<string, User>;

    constructor() {
        this.users = new Map();
    }

    async findById(id: string): Promise<User | null> {
        try {
            const user = this.users.get(id);
            return user || null;
        } catch (error) {
            console.error(`Error finding user ${id}:`, error);
            return null;
        }
    }

    async create(userData: Omit<User, 'id'>): Promise<User> {
        const id = crypto.randomUUID();
        const user: User = { id, ...userData };
        
        if (this.validateUser(user)) {
            this.users.set(id, user);
            return user;
        } else {
            throw new Error('Invalid user data');
        }
    }

    async update(user: User): Promise<void> {
        if (!this.users.has(user.id)) {
            throw new Error('User not found');
        }
        this.users.set(user.id, user);
    }

    async delete(id: string): Promise<void> {
        if (!this.users.delete(id)) {
            throw new Error('User not found');
        }
    }

    private validateUser(user: User): boolean {
        return Boolean(
            user.id &&
            user.name &&
            user.email &&
            ['admin', 'user', 'guest'].includes(user.role)
        );
    }
}
