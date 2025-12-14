import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import apiClient from '../../services/api';

type UserStatus = 'active' | 'pending' | 'blocked';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: UserStatus;
  lastLogin: string;
}

interface AdminUserEditModalProps {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSave: (user: AdminUser) => void;
}

export function AdminUserEditModal({ open, user, onClose, onSave }: AdminUserEditModalProps) {
  const [form, setForm] = useState<AdminUser | null>(user);

  useEffect(() => {
    setForm(user);
  }, [user]);

  if (!form) return null;

  interface PatchResponse {
    data: {
      data: AdminUser;
    };
  }

  const handleSubmit = async () => {
    const res = await apiClient.patch<PatchResponse['data']>(`/user/${form.id}`, {
      fullName: form.fullName,
      email: form.email,
      role: form.role,
      status: form.status,
    });
    const updated = res.data?.data;
    if (updated) {
      onSave(updated);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Update account details and activation status.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <Select value={form.role} onValueChange={(role: string) => setForm({ ...form, role })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="passenger">Passenger</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={form.status}
              onValueChange={(status: UserStatus) => setForm({ ...form, status })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
