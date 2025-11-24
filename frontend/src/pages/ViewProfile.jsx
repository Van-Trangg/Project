import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/apiClient'
import '../styles/Profile.css'
import defaultAva from '../public/avt.png'
import backIcon from '../public/back.png'
import newBackIcon from '../public/new_back.png'
import coverImg from '../public/ảnh bìa.jpg'
import BadgeCard from '../components/BadgeCard'
import { listBadges } from '../api/reward'

export default function ViewProfile(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [badgeVersions, setBadgeVersions] = useState([])
  const [badgesLoading, setBadgesLoading] = useState(false)
  const [badgesError, setBadgesError] = useState(null)
  const [backHovering, setBackHovering] = useState(false)
  const [backActive, setBackActive] = useState(false)

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

  // Load all badges and mark unlocked based on this user's total points
  useEffect(() => {
    if (!user) return
    setBadgesLoading(true)
    setBadgesError(null)
    listBadges()
      .then(r => {
        const data = r && r.data ? r.data : []
        const points = user.total_eco_points || user.eco_points || 0
        const versions = (data || []).map(v => ({
          ...v,
          badges: (v.badges || []).map(b => ({ ...b, unlocked: points >= (b.threshold || 0) }))
        }))
        setBadgeVersions(versions)
      })
      .catch(e => {
        console.error('Could not load badges', e)
        setBadgesError(e)
      })
      .finally(() => setBadgesLoading(false))
  }, [user])

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="loading">Không tải được hồ sơ.</div>
  if (!user) return <div className="loading">Không tìm thấy người dùng</div>

  const fullName = user.full_name || user.name || user.display_name || ''
  const nickName = user.nickname || user.username || user.handle || ''
  const phoneVal = user.phone || user.phone_number || user.mobile || ''
  const addressVal = user.address || user.location || user.place || ''
  const emailVal = user.email || user.mail || user.email_address || ''
  const bioVal = user.bio || user.about || user.description || ''

  return (
    <div className="page-anim profile-page">
      <div className="profile-header">
        <button
          className="back-rect"
          onClick={() => { setBackActive(true); navigate(-1); setTimeout(()=>setBackActive(false), 180) }}
          onMouseEnter={() => setBackHovering(true)}
          onMouseLeave={() => { setBackHovering(false); setBackActive(false) }}
          onMouseDown={() => setBackActive(true)}
          onMouseUp={() => setBackActive(false)}
          title="Back"
          style={{ zIndex: 1000, transform: backHovering ? 'translateY(-2px) scale(1.03)' : 'none', transition: 'transform .12s ease' }}
        >
          <img src={(backActive || backHovering) ? newBackIcon : backIcon} alt="Back" />
        </button>
        <div className="cover-placeholder" style={{ backgroundImage: `url(${coverImg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3,boxShadow: "0 4px 20px rgba(0, 0, 0, 1.0)"}}></div>
        <div className="avatar-wrapper">
          <div className="avatar-placeholder">
            <img
              src={user.avatar_url || defaultAva}
              alt="Avatar"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAva }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', display: 'block' }}
            />
          </div>
        </div>
      </div>

      <div className="profile-info">
        <>
          <h2>{fullName || '@fullname'}</h2>
          <p className="nickname">@{nickName || 'nickname'}</p>
          <p className="profile-bio">{bioVal || '@bio'}</p>
        </>

        <div className="stats">
          <div><strong>{user.check_ins || 0}</strong><p>Lượt check-in</p></div>
          <div><strong>{user.badges_count || 0}</strong><p>Huy hiệu</p></div>
          <div><strong>{user.rank || 'N/A'}</strong><p>Xếp hạng</p></div>
        </div>

        <div className="section personal-details">
          <h3>Thông tin cá nhân</h3>
          <div className="info-fields">
            <div className="info-block">
              <span className="info-label">Điện thoại</span>
              <div className="info-value"><span className="value-text">{phoneVal || '-'}</span></div>
            </div>
            <div className="info-block">
              <span className="info-label">Địa chỉ</span>
              <div className="info-value"><span className="value-text">{addressVal || '-'}</span></div>
            </div>
            <div className="info-block">
              <span className="info-label">Email</span>
              <div className="info-value"><span className="value-text">{emailVal || '-'}</span></div>
            </div>
          </div>
        </div>
      
        <div className="badges-section">
          <h3>Huy hiệu</h3>
          {badgesLoading ? (
            <div className="loading">Đang tải huy hiệu...</div>
          ) : badgesError ? (
            <div className="loading">Không tải được huy hiệu.</div>
          ) : !badgeVersions || badgeVersions.length === 0 ? (
            <p>Không có huy hiệu.</p>
          ) : (
            badgeVersions.map(v => {
              const owned = (v.badges || []).filter(b => !!b.unlocked)
              if (!owned || owned.length === 0) return null
              return (
                  <div key={v.version || v.title} className="badge-version">
                      <h4 style={{ marginLeft: 20, textAlign: 'left', width: '90%', maxWidth: 720 }}>{v.title || `Version ${v.version}`}</h4>
                  <div className="badges-grid" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {owned.map(b => (
                      <BadgeCard key={b.id} badge={b} unlocked={true} />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
