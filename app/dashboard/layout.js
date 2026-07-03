import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
            <Sidebar />
            <main style={{ marginLeft: '240px', width: 'calc(100% - 240px)', minHeight: '100vh' }}>
                {children}
            </main>
        </div>
    );
}