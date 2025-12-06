import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../api/profile' 
import BadgeCard from '../components/BadgeCard'
import { baseURL } from '../api/apiClient'
import { listBadgesForUser,listBadges } from '../api/reward'
import editIcon from '../public/edit.png'
import newEditIcon from '../public/new_edit.png'
import backIcon from '../public/back.png'
import newBackIcon from '../public/new_back.png'
import exitIcon from '../public/exit.png'
import newExitIcon from '../public/new_exit.png'
import viewAllIcon from '../public/view_all.png'
import defaultAva from '../public/avt.png'
import coverImg from '../public/ảnh bìa.png'
import '../styles/Profile.css'
import gift from '../public/gift.png'

export default function Profile() {
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null)
    const [hoveringEdit, setHoveringEdit] = useState(false)
    const [backHovering, setBackHovering] = useState(false)
    const [backActive, setBackActive] = useState(false)
    const [exitHovering, setExitHovering] = useState(false)
    const [exitActive, setExitActive] = useState(false)
    const [giftHovering, setGiftHovering] = useState(false)
    const [giftActive, setGiftActive] = useState(false)
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
    const [selectedBadge, setSelectedBadge] = useState(null)
    // prevent background scroll when badge modal open
    useEffect(() => {
        if (typeof document === 'undefined') return
        const prev = document.body.style.overflow
        if (selectedBadge) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = prev
        return () => { document.body.style.overflow = prev }
    }, [selectedBadge])
    useEffect(() => {
            listBadgesForUser().then(r => {
                const payload = r.data || { versions: [] }
                // payload.versions is an array of { version, title, badges: [] }
                const allBadges = (payload.versions || []).flatMap(v => v.badges || [])
                // prioritize unlocked badges then others, then by threshold
                const sorted = allBadges.sort((a,b) => {
                    const ua = a.unlocked ? 0 : 1
                    const ub = b.unlocked ? 0 : 1
                    if (ua !== ub) return ua - ub
                    return (a.threshold||0) - (b.threshold||0)
                })
                    // show as many badges as available (will be clipped by CSS to viewport)
                    setPreviewBadges(sorted)
            }).catch(()=>{
                // fallback: try public listing which returns versions array
                listBadges().then(r2 => {
                    const versions = r2.data || []
                    const all = (versions || []).flatMap(v => v.badges || [])
                    const sortedPublic = all.sort((a,b)=>{
                        const ua = a.unlocked ? 0 : 1
                        const ub = b.unlocked ? 0 : 1
                        if (ua !== ub) return ua - ub
                        return (a.threshold||0) - (b.threshold||0)
                    })
                    // show as many as available; CSS will clip to viewport height
                    setPreviewBadges(sortedPublic)
                }).catch(()=>{
                    setPreviewBadges([])
                })
            })
    }, [])
    const handleLogout = () => {
        localStorage.removeItem('access_token')
        setShowExitConfirm(false)
        navigate('/checkout')
    }
    if (error) return <div className="loading">Không tải được profile. Vui lòng thử lại sau.</div>
    if (!user) return <div className="loading">Đang tải...</div>

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
        <div className="page-anim profile-page">
            {/* HEADER */}
            <div className="profile-header">
                <button
                    className="back-rect"
                    onClick={() => { setBackActive(true); navigate('/home') }}
                    onMouseEnter={() => setBackHovering(true)}
                    onMouseLeave={() => setBackHovering(false)}
                    title="Back"
                    style={{ zIndex: 1000 }}>
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
                    style={{ zIndex: 1000 }}
                >
                    <img
                        src={exitHovering ? newExitIcon : exitIcon}
                        alt="Exit"
                    />
                </button>

                <button
                    className="gift-rect"
                    onClick={() => { setGiftActive(true); navigate('/invite') }}
                    onMouseEnter={() => setGiftHovering(true)}
                    onMouseLeave={() => setGiftHovering(false)}
                    title="Mã mời"
                    style={{ zIndex: 1000 }}
                >
                    <img
                        src={giftHovering ? gift : gift}
                        alt="Gift"
                    />
                </button>

                <div className="cover-placeholder" style={{ backgroundImage: `url(${coverImg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3,boxShadow: "0 4px 20px rgba(0, 0, 0, 1.0)" }}></div>

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
                    <div className="avatar-placeholder">
                        <img
                            src={(user.avatar_url && user.avatar_url !== "null") ? user.avatar_url : defaultAva}
                            alt="Avatar"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAva }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', display: 'block' }}
                        />
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
                    <div><strong>{user.check_ins || 0}</strong><p>Lượt check-in</p></div>
                        <div><strong>{user.badges_count || 0}</strong><p>Huy hiệu</p></div>
                        <div><strong>{user.rank || 'N/A'}</strong><p>Xếp hạng</p></div>
                </div>

                {/*  */}
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
            </div>

            {/* BADGES */}
                <div className="badges-section">
                <div className="badges-header-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h3>Huy hiệu</h3>
                    <img
                        src={viewAllIcon}
                        alt="Xem tất cả huy hiệu"
                        onClick={() => navigate('/badges')}
                        style={{ width: 30, height: 30, cursor: 'pointer', border: 'none', background: 'transparent', padding: 0, transform: 'translateX(-10px)' }}
                    />
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
                                <BadgeCard key={b.id} badge={b} unlocked={b.unlocked} className="profile-badge-small" onClick={(badge) => setSelectedBadge(badge)} />
                            ))
                        )}
                    </div>
            </div>

            {/* */}
            {showExitConfirm && (
                <div className="exit-confirm-overlay" onClick={() => setShowExitConfirm(false)}>
                    <div className="exit-confirm" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setShowExitConfirm(false)}
                            aria-label="Close"
                            className="exit-close-btn"
                        >
                            ✕
                        </button>
                        <h3 className="exit-confirm-title">Bạn có chắc chắn muốn đăng xuất không?</h3>
                        <div className="exit-confirm-actions">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn exit-logout-btn"
                            >
                                Đăng xuất
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowExitConfirm(false)}
                                className="btn btn-secondary exit-back-btn"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Badge detail modal (centered, fixed) */}
            {selectedBadge && (typeof document !== 'undefined' ? createPortal(
                <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
                    <div className="badge-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={
                                selectedBadge.image
                                    ? (selectedBadge.image.startsWith('http') ? selectedBadge.image : `${baseURL}/badges/${selectedBadge.image}`)
                                    : (selectedBadge.image_url || '')
                            }
                            alt={selectedBadge.name || selectedBadge.badge}
                            className="badge-modal-img"
                        />

                        <h3 className="badge-modal-title">{selectedBadge.name || selectedBadge.badge}</h3>

                        <p className="badge-modal-desc">{selectedBadge.description || 'Huy hiệu văn hóa đặc biệt'}</p>

                        {selectedBadge.unlocked_at && (
                            <small style={{ color: '#A9BC96' }}>
                                Đạt được: {new Date(selectedBadge.unlocked_at).toLocaleDateString()}
                            </small>
                        )}

                        <button className="badge-close-btn" onClick={() => setSelectedBadge(null)}>Đóng</button>
                    </div>
                </div>, document.body) : null)}
        </div>
    )
}