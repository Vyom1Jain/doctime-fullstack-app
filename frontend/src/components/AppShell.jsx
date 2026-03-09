import BottomNav from './BottomNav'

const AppShell = ({ children }) => (
  <div className="max-w-lg mx-auto min-h-screen pb-16 relative">
    {children}
    <BottomNav />
  </div>
)

export default AppShell
