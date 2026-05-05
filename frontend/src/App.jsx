import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginScreen      from './screens/LoginScreen'
import SignupScreen     from './screens/SignupScreen'
import TodayScreen      from './screens/TodayScreen'
import HabitsScreen     from './screens/HabitsScreen'
import TasksScreen      from './screens/TasksScreen'
import CategoriesScreen from './screens/CategoriesScreen'
import AddScreen        from './screens/AddScreen'
import BottomNavbar     from './components/BottomNavbar'
import ProtectedRoute   from './components/ProtectedRoute'

const AUTH_PATHS = ['/login', '/signup']

export default function App() {
  const { pathname } = useLocation()
  const isAuth = AUTH_PATHS.includes(pathname)

  return (
    <div className="app-container" style={{ position: 'relative', width: '390px', margin: '0 auto', minHeight: '100vh', overflow: 'hidden', backgroundColor: '#0A0A0A' }}>
      <Routes>
        <Route path="/"            element={<Navigate to="/today" replace />} />
        <Route path="/login"       element={<LoginScreen />} />
        <Route path="/signup"      element={<SignupScreen />} />
        <Route path="/today"       element={<ProtectedRoute><TodayScreen /></ProtectedRoute>} />
        <Route path="/habits"      element={<ProtectedRoute><HabitsScreen /></ProtectedRoute>} />
        <Route path="/tasks"       element={<ProtectedRoute><TasksScreen /></ProtectedRoute>} />
        <Route path="/categories"  element={<ProtectedRoute><CategoriesScreen /></ProtectedRoute>} />
        <Route path="/add"         element={<ProtectedRoute><AddScreen /></ProtectedRoute>} />
        <Route path="*"            element={<Navigate to="/today" replace />} />
      </Routes>
      {!isAuth && <BottomNavbar />}
    </div>
  )
}
