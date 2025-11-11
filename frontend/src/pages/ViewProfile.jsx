import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/apiClient'
import '../styles/Profile.css'

export default function ViewProfile(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) { setError('No user id'); setLoading(false); return }
    setLoading(true)
    api.get(`/users/${id}`)
      .then(r => setUser(r.data))
      .catch(err => {
        console.error('Could not load user', err)
        setError(err)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="loading">Could not load profile.</div>
  if (!user) return <div className="loading">User not found</div>

  const fullName = user.full_name || user.name || user.display_name || ''
  const nickName = user.nickname || user.username || user.handle || ''
  const phoneVal = user.phone || user.phone_number || user.mobile || ''
  const addressVal = user.address || user.location || user.place || ''
  const emailVal = user.email || user.mail || user.email_address || ''
  const bioVal = user.bio || user.about || user.description || ''

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-rect" onClick={() => navigate(-1)} title="Back">←</button>
        <div className="cover-placeholder"></div>
        <div className="avatar-wrapper">
          <div className="avatar-placeholder" style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
        </div>
      </div>

      <div className="profile-info">
        <>
          <h2>{fullName || '@fullname'}</h2>
          <p className="nickname">@{nickName || 'nickname'}</p>
          <p className="profile-bio">{bioVal || '@bio'}</p>
        </>

        <div className="stats">
          <div><strong>{user.check_ins || 0}</strong><p>Check-ins</p></div>
          <div><strong>{user.badges_count || 0}</strong><p>Badges</p></div>
          <div><strong>{user.rank || 'N/A'}</strong><p>Rank</p></div>
        </div>

        <div className="section personal-details">
          <h3>Personal details</h3>
          <div className="info-fields">
            <div className="info-block">
              <span className="info-label">Phone</span>
              <div className="info-value"><span className="value-text">{phoneVal || '-'}</span></div>
            </div>
            <div className="info-block">
              <span className="info-label">Location</span>
              <div className="info-value"><span className="value-text">{addressVal || '-'}</span></div>
            </div>
            <div className="info-block">
              <span className="info-label">Email</span>
              <div className="info-value"><span className="value-text">{emailVal || '-'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
