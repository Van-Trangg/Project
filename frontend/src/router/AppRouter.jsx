import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Leaderboard from '../pages/Leaderboard'
import Journal from '../pages/Journal'
import Map from '../pages/Map'
import Profile from '../pages/Profile'
import Reward from '../pages/Reward'

export default function AppRouter(){
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/leaderboard" element={<Leaderboard/>} />
          <Route path="/journal" element={<Journal/>} />
          <Route path="/map" element={<Map/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/reward" element={<Reward/>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}