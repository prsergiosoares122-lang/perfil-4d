import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: '256px', width: '100%', padding: '20px' }}>
                {children}
            </main>
        </div>
    );
}