import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export const AdminPageHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
    </div>
);

export const AdminStatCard = ({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: string }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
            </div>
            <div className={`rounded-xl p-3 ${tone}`}>
                <Icon size={22} />
            </div>
        </div>
    </div>
);

export const AdminTableShell = ({ children }: { children: ReactNode }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">{children}</div>
    </div>
);

export const AdminStatusBadge = ({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue' }) => {
    const tones = {
        slate: 'bg-slate-100 text-slate-600',
        green: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        red: 'bg-red-50 text-red-700',
        blue: 'bg-blue-50 text-blue-700',
    };

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tones[tone]}`}>{children}</span>;
};

export const AdminEmptyState = ({ text }: { text: string }) => (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm font-semibold text-slate-400">{text}</div>
);
