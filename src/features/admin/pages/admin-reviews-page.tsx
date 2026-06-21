import { useMemo, useState } from 'react';
import { Search, Star, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminPageHeader, AdminTableShell } from '../components/admin-ui';
import { useAdminReviews, useDeleteAdminReview } from '../hooks/use-admin';

const AdminReviewsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data, isLoading } = useAdminReviews();
    const deleteReview = useDeleteAdminReview();
    const reviews = data?.content || [];

    const filteredReviews = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return reviews;
        return reviews.filter((review) =>
            [review.username, review.productName, review.comment, review.rating]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword))
        );
    }, [reviews, searchTerm]);

    return (
        <div>
            <AdminPageHeader title="Quản lý đánh giá" description="Kiểm duyệt phản hồi của khách hàng theo sản phẩm và người dùng." />
            <div className="mb-4 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm người đánh giá, sản phẩm, nội dung..." className="h-12 flex-1 bg-transparent text-sm outline-none" />
            </div>

            {isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-white" /> : filteredReviews.length ? (
                <AdminTableShell>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-400">
                            <tr>
                                <th className="px-5 py-3">Người đánh giá</th>
                                <th className="px-5 py-3">Sản phẩm</th>
                                <th className="px-5 py-3">Điểm</th>
                                <th className="px-5 py-3">Nội dung</th>
                                <th className="px-5 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReviews.map((review) => (
                                <tr key={review.id}>
                                    <td className="px-5 py-4 font-bold text-slate-700">{review.username}</td>
                                    <td className="px-5 py-4 text-slate-600">{review.productName}</td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1 font-black text-amber-600"><Star size={14} /> {review.rating}</span>
                                    </td>
                                    <td className="max-w-lg px-5 py-4 text-slate-600">{review.comment}</td>
                                    <td className="px-5 py-4 text-right">
                                        <button onClick={() => deleteReview.mutate(review.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 size={17} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminTableShell>
            ) : <AdminEmptyState text="Không tìm thấy đánh giá phù hợp." />}
        </div>
    );
};

export default AdminReviewsPage;
