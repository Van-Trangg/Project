import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Leaderboard from '../pages/Leaderboard'
import Journal from '../pages/Journal'
import Map from '../pages/Map'
import CheckIn from '../pages/Checkin.jsx'
import Profile from '../pages/Profile'
import EditProfile from '../pages/EditProfile'
import Reward from '../pages/Reward'
import Badges from '../pages/Badges'
import ResetPassword from '../pages/ResetPassword'
import VerifyCode from '../pages/VerifyCode'
import ResetComplete from '../pages/ResetComplete'
import SetNewPassword from '../pages/SetNewPassword'
import LocationJournal from '../pages/LocationJournal.jsx'
import SignupComplete from '../pages/SignupComplete'
import ViewProfile from '../pages/ViewProfile'
import HistoryPage from '../pages/HistoryPage'
import DetailPage from '../pages/DetailPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

export default function AppRouter(){
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/checkout" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/leaderboard" element={<Leaderboard/>} />
          <Route path="/journal" element={<Journal/>} />
          <Route path="/map" element={<Map/>} />
          <Route path="/checkin/:locationId" element={<CheckIn/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/profile/view/:id" element={<ViewProfile/>} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />
          <Route path="/reset-complete" element={<ResetComplete />} />
          <Route path="/signup-complete" element={<SignupComplete />} />
          <Route path="/reward" element={<Reward/>} />
          <Route path="/history" element={<HistoryPage/>} />
          <Route path="/detail" element={<DetailPage/>} />
          <Route path="/badges" element={<Badges/>} />
          <Route path="/location/:id" element={<LocationJournal/>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}