import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Key, Edit2, Users, UserCheck, Clock, Ban, Search } from 'lucide-react';
import apiClient from '../services/api';
import { AdminUserEditModal } from '../components/admin/AdminUserEditModal';

type UserStatus = 'active' | 'pending' | 'blocked';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: UserStatus;
  lastLogin: string;
}

type ApiResponse<T> = {
  data: T;
};

type ApiUserRecord = {
  id?: string;
  _id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: UserStatus;
  isActive?: boolean;
  lastLogin?: string;
};

function mapApiUser(user: ApiUserRecord): AdminUser {
  return {
    id: user.id ?? user._id ?? 'unknown',
    fullName: user.fullName ?? user.name ?? 'Unknown',
    email: user.email ?? 'unknown@example.com',
    role: user.role ?? 'passenger',
    status: user.status ?? (user.isActive ? 'active' : 'blocked'),
    lastLogin: user.lastLogin ?? '—',
  };
}

interface Summary {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  blockedUsers: number;
}

export function AdminUsersPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const usersRes = await apiClient.get<ApiResponse<ApiUserRecord[]>>('/user/all');
        const usersData = usersRes.data?.data ?? [];

        const mappedUsers = usersData.map(mapApiUser);

        const summaryData: Summary = {
          totalUsers: mappedUsers.length,
          activeUsers: mappedUsers.filter((u) => u.status === 'active').length,
          pendingUsers: mappedUsers.filter((u) => u.status === 'pending').length,
          blockedUsers: mappedUsers.filter((u) => u.status === 'blocked').length,
        };

        setSummary(summaryData);
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!query) {
      setFilteredUsers(users);
      return;
    }
    const q = query.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      ),
    );
  }, [query, users]);

  const handleResetPassword = async (id: string) => {
    await apiClient.post(`/user/${id}/reset-password`);
    // Optionally show a toast notification here
  };

  const handleStatusToggle = async (id: string, nextStatus: UserStatus) => {
    const res = await apiClient.patch<ApiResponse<ApiUserRecord>>(`/user/${id}`, {
      status: nextStatus,
    });
    const updated = mapApiUser(res.data?.data ?? {});
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = (updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    closeEditModal();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-xl font-semibold">Users Management</h1>
            <p className="text-sm text-muted-foreground">Manage system users and their access</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-5 w-5 text-primary" />
                <span>{summary?.totalUsers ?? '--'}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UserCheck className="h-5 w-5 text-emerald-500" />
                <span>{summary?.activeUsers ?? '--'}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Pending</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>{summary?.pendingUsers ?? '--'}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Blocked</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Ban className="h-5 w-5 text-destructive" />
                <span>{summary?.blockedUsers ?? '--'}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Users List</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-8"
                  />
                </div>
                <Button variant="default" className="hidden md:inline-flex">
                  + Add User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 text-left font-medium">User</th>
                      <th className="py-2 text-left font-medium">Email</th>
                      <th className="py-2 text-left font-medium">Role</th>
                      <th className="py-2 text-left font-medium">Status</th>
                      <th className="py-2 text-left font-medium">Last Login</th>
                      <th className="py-2 pr-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">{user.email}</td>
                        <td className="py-3">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="py-3 text-muted-foreground">{user.lastLogin}</td>
                        <td className="py-3 pr-2">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => void handleResetPassword(user.id)}
                              title="Reset password"
                            >
                              <Key className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant={user.status === 'active' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() =>
                                void handleStatusToggle(
                                  user.id,
                                  user.status === 'active' ? 'blocked' : 'active',
                                )
                              }
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditModal(user)}
                              title="Edit user"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <AdminUserEditModal
          open={isEditOpen}
          user={selectedUser}
          onClose={closeEditModal}
          onSave={handleUserUpdated}
        />
      </div>
    </Layout>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === 'active') {
    return <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>;
  }
  if (status === 'pending') {
    return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
  }
  return <Badge variant="destructive">Blocked</Badge>;
}
