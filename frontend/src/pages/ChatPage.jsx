import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-8">
          <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
          <p className="text-gray-500 mt-1">Coming soon.</p>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
