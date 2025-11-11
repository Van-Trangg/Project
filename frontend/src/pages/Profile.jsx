import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../api/profile' 
import BadgeCard from '../components/BadgeCard'
import { listRewardsForUser } from '../api/reward'
import editIcon from '../public/edit.png'
import newEditIcon from '../public/new_edit.png'
import backIcon from '../public/back.png'
import newBackIcon from '../public/new_back.png'
import exitIcon from '../public/exit.png'
import newExitIcon from '../public/new_exit.png'
import '../styles/Profile.css'

export default function Profile() {
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null)
    const [hoveringEdit, setHoveringEdit] = useState(false)
    const [backHovering, setBackHovering] = useState(false)
    const [backActive, setBackActive] = useState(false)
    const [exitHovering, setExitHovering] = useState(false)
    const [exitActive, setExitActive] = useState(false)
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        getProfile()
            .then(r => setUser(r.data))
            .catch(err => {
                console.error('Failed to load profile', err)
                setError(err)
            })
    }, [])

    // fetch small preview of badges (sync with /reward/me)
    const [previewBadges, setPreviewBadges] = useState([])
    useEffect(() => {
        listRewardsForUser().then(r => {
            const payload = r.data || { rewards: [] }
            // prioritize unlocked badges then others
            const sorted = (payload.rewards || []).sort((a,b) => {
                const ua = a.unlocked ? 0 : 1
                const ub = b.unlocked ? 0 : 1
                if (ua !== ub) return ua - ub
                return (a.threshold||0) - (b.threshold||0)
            })
            setPreviewBadges(sorted.slice(0,3))
        }).catch(()=>{
            setPreviewBadges([])
        })
    }, [])
    const handleLogout = () => {
        localStorage.removeItem('access_token')
        setShowExitConfirm(false)
        navigate('/checkout')
    }
    if (error) return <div className="loading">Không tải được profile. Vui lòng thử lại sau.</div>
    if (!user) return <div className="loading">Loading...</div>

    // normalize fields
    const fullName = user.full_name || user.name || user.display_name || ''
    const nickName = user.nickname || user.username || user.handle || ''
    const phoneVal = user.phone || user.phone_number || user.mobile || ''
    const addressVal = user.address || user.location || user.place || ''
    const emailVal = user.email || user.mail || user.email_address || ''
    const bioVal = user.bio || user.about || user.description || ''

 
    const startEdit = () => {
        navigate('/edit-profile')
    }

    return (
        <div className="profile-page">
            {/* HEADER */}
            <div className="profile-header">
                <button
                    className="back-rect"
                    onClick={() => { setBackActive(true); navigate('/home') }}
                    onMouseEnter={() => setBackHovering(true)}
                    onMouseLeave={() => setBackHovering(false)}
                    title="Back">
                    <img src={(backActive || backHovering) ? newBackIcon : backIcon} alt="Back" />
                </button>

                <button
                    className="exit-rect"
                    onClick={() => {
                        setExitActive(true)
                        setShowExitConfirm(true)
                    }}
                    onMouseEnter={() => setExitHovering(true)}
                    onMouseLeave={() => setExitHovering(false)}
                    title="Exit"
                >
                    <img
                        src={exitHovering ? newExitIcon : exitIcon}
                        alt="Exit"
                    />
                </button>

                <div className="cover-placeholder"></div>

                <button
                    className="edit-btn"
                    onClick={startEdit} 
                    onMouseEnter={() => setHoveringEdit(true)}
                    onMouseLeave={() => setHoveringEdit(false)}
                    title="Edit profile">
                    {}
                    <img src={hoveringEdit ? newEditIcon : editIcon} alt="Edit" />
                </button>

                <div className="avatar-wrapper">
                    {}
                    <div
                        className="avatar-placeholder"
                        style={user.avatar_url ? {
                            backgroundImage: `url(${user.avatar_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        } : {}}
                    >
                    </div>
                </div>
            </div>

            {/* INFO */}
            <div className="profile-info">
                {/*  */}
                <>
                    <h2>{fullName || '@fullname'}</h2>
                    <p className="nickname">@{nickName || 'nickname'}</p> {/*  */}
                    <p className="profile-bio">{bioVal || '@bio'}</p>
                </>

                <div className="stats">
                    <div><strong>{user.check_ins || 0}</strong><p>Check-ins</p></div>
                    <div><strong>{user.badges_count || 0}</strong><p>Badges</p></div>
                    <div><strong>{user.rank || 'N/A'}</strong><p>Rank</p></div>
                </div>

                {/*  */}
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

            {/* BADGES */}
            <div className="badges-section">
                <div className="badges-header-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h3>Badges</h3>
                    <button className="btn view-badges-btn" onClick={() => navigate('/badges')}>View all</button>
                </div>
                    <div className="badge-list">
                        {previewBadges.length === 0 ? (
                            <>
                                <div className="badge-card placeholder"></div>
                                <div className="badge-card placeholder"></div>
                                <div className="badge-card placeholder"></div>
                            </>
                        ) : (
                            previewBadges.map(b => (
                                <BadgeCard key={b.id} badge={b} unlocked={b.unlocked} className="profile-badge-small" onClick={() => navigate('/badges')} />
                            ))
                        )}
                    </div>
            </div>

            {/* */}
            {showExitConfirm && (
                <div
                    className="exit-confirm-overlay"
                    onClick={() => setShowExitConfirm(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
                >
                    <div
                        className="exit-confirm"
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: '#EFF5D2', padding: 28, borderRadius: 30, width: '88%', maxWidth: 320, textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}
                    >
                        <button
                            type="button"
                            onClick={() => setShowExitConfirm(false)}
                            aria-label="Close"
                            style={{ position: 'absolute', right: 22, top: 18, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                        <h3 style={{ color: '#556B2F', fontSize: 20, margin: '12px 0 18px', fontWeight: 700 }}>Are you sure you want to log out?</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn exit-logout-btn"
                            >
                                Log out
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowExitConfirm(false)}
                                className="btn btn-secondary exit-back-btn"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}