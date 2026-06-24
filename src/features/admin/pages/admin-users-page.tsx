import { useMemo, useState } from 'react';
import { Search, Trash2, UsersRound } from 'lucide-react';
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from '../components/admin-ui';
import { useAdminUsers, useDeleteAdminUser, useUpdateAdminUserStatus } from '../hooks/use-admin';

const USER_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING'];

const AdminUsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: users = [], isLoading } = useAdminUsers();
    const deleteUser = useDeleteAdminUser();
    const updateUserStatus = useUpdateAdminUserStatus();

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return users;
        return users.filter((user) =>
            [user.username, user.fullName, user.email, user.phone, user.roleName, user.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword))
        );
    }, [users, searchTerm]);

    return (
        <div>
            <AdminPageHeader title="Quản lý người dùng" description="Tra cứu tài khoản, vai trò và trạng thái người dùng trong hệ thống." />
            <div className="mb-4 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm tên, email, số điện thoại..." className="h-12 flex-1 bg-transparent text-sm outline-none" />
            </div>

            {isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-white" /> : filteredUsers.length ? (
                <AdminTableShell>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-400">
                            <tr>
                                <th className="px-5 py-3">Người dùng</th>
                                <th className="px-5 py-3">Liên hệ</th>
                                <th className="px-5 py-3">Vai trò</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><UsersRound size={18} /></div>
                                            <div>
                                                <p className="font-black text-slate-950">{user.fullName || user.username}</p>
                                                <p className="text-xs text-slate-400">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">
                                        <p>{user.email || 'Chưa cập nhật'}</p>
                                        <p className="text-xs text-slate-400">{user.phone || 'Chưa có SĐT'}</p>
                                    </td>
                                    <td className="px-5 py-4"><AdminStatusBadge tone="blue">{user.roleName || 'USER'}</AdminStatusBadge></td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-2">
                                            <AdminStatusBadge tone={user.status === 'ACTIVE' ? 'green' : user.status === 'BANNED' ? 'red' : user.status === 'PENDING' ? 'amber' : 'slate'}>{user.status || 'UNKNOWN'}</AdminStatusBadge>
                                            <select
                                                value={user.status || 'ACTIVE'}
                                                onChange={(event) => updateUserStatus.mutate({ user, status: event.target.value })}
                                                disabled={updateUserStatus.isPending}
                                                className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-blue-500"
                                            >
                                                {USER_STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button onClick={() => deleteUser.mutate(user.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Xóa người dùng">
                                            <Trash2 size={17} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminTableShell>
            ) : <AdminEmptyState text="Không tìm thấy người dùng phù hợp." />}
        </div>
    );
};

export default AdminUsersPage;
