import { useEffect, useState } from 'react'
import { getProfile } from '../api/profile'
import '../styles/Profile.css'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProfile()
      .then(r => setUser(r.data))
      .catch(err => {
        console.error('Failed to load profile', err)
        setError(err)
      })
  }, [])

  if (error) return <div className="loading">Không tải được profile. Vui lòng thử lại sau.</div>
  if (!user) return <div className="loading">Loading...</div>

  return (
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        <div className="cover-placeholder"></div>

        <div className="avatar-wrapper">
          <div className="avatar-placeholder"></div>
          <button className="camera-btn">📸</button>
        </div>
      </div>

      {/* INFO */}
      <div className="profile-info">
        <h2>{user.full_name || 'Yến Nhi'}</h2>
        <p className="nickname">@{user.nickname || 'nickname'}</p>

        <div className="stats">
          <div><strong>{user.checkins || 100}</strong><p>Check-ins</p></div>
          <div><strong>{user.badges || 40}</strong><p>Badges</p></div>
          <div><strong>{user.rank || 20}</strong><p>Rank</p></div>
        </div>

        <div className="info-fields">
          <p><strong>Ngày sinh:</strong> {user.birthdate || '-'}</p>
          <p><strong>SĐT:</strong> {user.phone || '-'}</p>
          <p><strong>Address:</strong> {user.address || '-'}</p>
          <p><strong>Gmail:</strong> {user.email || '-'}</p>
        </div>
      </div>

      {/* BADGES */}
      <div className="badges-section">
        <h3>🎖️ Badges</h3>
        <div className="badge-list">
          <div className="badge-card placeholder"></div>
          <div className="badge-card placeholder"></div>
          <div className="badge-card placeholder"></div>
        </div>
      </div>
    </div>
  )
}
