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

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gym/:id" element={<GymDetail />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
        <Route path="/gym/create" element={<CreateGym />} />
        <Route path="/gym/edit/:id" element={<EditGym />} />
      </Routes>
    </>
  )
}

export default App