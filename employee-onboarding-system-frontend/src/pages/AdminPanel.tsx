import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import type { UserRole } from '../types/auth';
import type { User } from '../types/user';
import '../styles/AdminPanel.css';

const roles: UserRole[] = ['VIEWER', 'HR', 'MANAGER', 'FINANCE', 'IT', 'ADMIN'];

function AdminPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Record<number, UserRole>>({});
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const loadUsers = async () => {
        try {
            const data = await adminApi.getUsers();
            setUsers(data);

            const rolesByUser: Record<number, UserRole> = {};
                data.forEach((user) => {
                rolesByUser[user.id] = user.role;
            });

            setSelectedRoles(rolesByUser);
        } catch {
            setMessage('Failed to load users.');
            setMessageType('error');
        }
  };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = (userId: number, newRole: UserRole) => {
        setSelectedRoles((prev) => ({
            ...prev,
            [userId]: newRole,
        }));
    };

    const handleUpdateRole = async (user: User) => {
        try {
            const selectedRole = selectedRoles[user.id];

            await adminApi.updateUserRole(user.id, {
                role: selectedRole,
            });

            setMessage(`Role updated successfully for ${user.fullName}.`);
            setMessageType('success');

            await loadUsers();
        } catch {
            setMessage('Failed to update user role.');
            setMessageType('error');
        }
    };

    return (
        <section className="admin-panel-container">
            <div className="admin-panel-header">
                <h2>Admin Panel</h2>
                <p>Manage user roles and permissions.</p>
            </div>

            {message && (
                <p className={`admin-message admin-message-${messageType}`}>
                    {message}
                </p>
            )}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Current Role</th>
                            <th>New Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={selectedRoles[user.id] ?? user.role}
                                        onChange={(event) =>
                                            handleRoleChange(user.id, event.target.value as UserRole)
                                        }
                                    >
                                    {roles.map((roleOption) => (
                                        <option key={roleOption} value={roleOption}>
                                            {roleOption}
                                        </option>
                                    ))}
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="admin-update-button"
                                        onClick={() => handleUpdateRole(user)}
                                    >
                                        Update Role
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <p className="admin-empty">No users found.</p>
                )}
            </div>
        </section>
    );
}

export default AdminPanel;