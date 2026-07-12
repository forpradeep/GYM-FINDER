import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import GymDetail from './pages/GymDetail'
import Favourites from './pages/Favourites'
import OwnerDashboard from './pages/OwnerDashboard'
import CreateGym from './pages/CreateGym'
import EditGym from './pages/EditGym'
import Navbar from './components/navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import Members from './pages/Members'
import Settings from './pages/Settings'






function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        // add this route
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/gym/:gymId/members" element={
          <ProtectedRoute allowedRole="owner">
            <Members />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gym/:id" element={<GymDetail />} />
        <Route path="/favourites" element={
          <ProtectedRoute allowedRole="seeker">
            <Favourites />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="owner">
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/gym/create" element={
          <ProtectedRoute allowedRole="owner">
            <CreateGym />
          </ProtectedRoute>
        } />
        <Route path="/gym/edit/:id" element={
          <ProtectedRoute allowedRole="owner">
            <EditGym />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App