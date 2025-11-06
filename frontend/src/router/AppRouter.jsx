import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Leaderboard from '../pages/Leaderboard'
import Journal from '../pages/Journal'
import Map from '../pages/Map'
import Profile from '../pages/Profile'
import EditProfile from '../pages/EditProfile'
import Reward from '../pages/Reward'
import ResetPassword from '../pages/ResetPassword'
import VerifyCode from '../pages/VerifyCode'
import ResetComplete from '../pages/ResetComplete'
import SetNewPassword from '../pages/SetNewPassword'

export default function AppRouter(){
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/checkout" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
          <Route path="/leaderboard" element={<Leaderboard/>} />
          <Route path="/journal" element={<Journal/>} />
          <Route path="/map" element={<Map/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />
          <Route path="/reset-complete" element={<ResetComplete />} />
          <Route path="/reward" element={<Reward/>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}