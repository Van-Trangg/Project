import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../api/profile'
import { getInvite } from '../api/invite'
import copyIcon from '../public/copy.png'
import backIcon from '../public/back.png'
import defaultAva from '../public/avt.png'

export default function Invite() {
    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState('')
    const [claims, setClaims] = useState([])
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        let mounted = true
        Promise.allSettled([getInvite(), getProfile()])
            .then(results => {
                if (!mounted) return
                const [inviteRes, profileRes] = results

                // Ưu tiên lấy từ API invite-info
                if (inviteRes.status === 'fulfilled' && inviteRes.value && inviteRes.value.data) {
                    const d = inviteRes.value.data
                    if (d.my_referral_code) setCode(d.my_referral_code)
                    if (Array.isArray(d.invitees)) setClaims(d.invitees)
                }
                // Fallback: Lấy từ Profile nếu API invite lỗi nhẹ nhưng profile có data
                else if (profileRes.status === 'fulfilled' && profileRes.value && profileRes.value.data) {
                    const u = profileRes.value.data
                    if (u.referral_code) setCode(u.referral_code)
                }
                setLoading(false)
            }).catch(err => {
                if (!mounted) return
                console.error(err)
                setError(err)
                setLoading(false)
            })
        return () => { mounted = false }
    }, [])

    // --- HÀM COPY (ĐÃ ĐƯỢC THÊM LẠI) ---
    const copyToClipboard = async () => {
        if (!code) {
            setToast('Không có mã để sao chép')
            setTimeout(() => setToast(null), 2500)
            return
        }
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(code)
            } else {
                const ta = document.createElement('textarea')
                ta.value = code
                ta.style.position = 'fixed'
                ta.style.left = '-9999px'
                document.body.appendChild(ta)
                ta.select()
                const ok = document.execCommand('copy')
                document.body.removeChild(ta)
                if (!ok) throw new Error('execCommand failed')
            }
            setToast('Đã sao chép mã mời')
            setTimeout(() => setToast(null), 2500)
        } catch (e) {
            console.error('copy failed', e)
            setToast('Không thể sao chép mã mời')
            setTimeout(() => setToast(null), 2500)
        }
    }
    // ------------------------------------

    const getDisplayName = (user) => {
        if (user.full_name && user.full_name.trim() !== "") return user.full_name;
        if (user.nickname && user.nickname.trim() !== "") return user.nickname;
        if (user.email) {
            const part = user.email.split('@');
            if (part[0].length > 3) {
                return part[0].substring(0, 3) + "***@" + part[1];
            }
            return "***@" + part[1];
        }
        return "Người dùng ẩn danh";
    };

    const handleViewProfile = (userId) => {
        navigate(`/profile/view/${userId}`);
    };

    if (loading) return <div className="loading">Đang tải...</div>
    // Tạm thời ẩn lỗi để không crash giao diện nếu API chập chờn
    // if (error) return <div className="loading">Không tải được nội dung.</div>

    return (
        <div className="page-anim profile-page" style={{ padding: '20px' }}>
            <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'transparent', padding: 0, marginBottom: 12 }}>
                <img src={backIcon} alt="Back" style={{ width: 28, height: 28 }} />
            </button>

            <h2>Mời bạn</h2>
            <p style={{ color: '#666' }}>Chia sẻ mã mời để bạn bè nhận quà và bạn nhận thưởng.</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
                <div style={{ padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: '#556B2F' }}>{code || '—'}</div>
                    <button onClick={copyToClipboard} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} title="Sao chép">
                        <img src={copyIcon} alt="Copy" style={{ width: 28, height: 28 }} />
                    </button>
                </div>
            </div>

            {toast && (
                <div aria-live="polite" style={{ position: 'fixed', right: 20, top: 84, background: '#233', color: '#fff', padding: '10px 14px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 999 }}>
                    {toast}
                </div>
            )}

            <h3 style={{ marginTop: 28 }}>Đồng đội xanh ({claims.length})</h3>

            {(!claims || claims.length === 0) ? (
                <div style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
                    <p>Chưa có ai sử dụng mã của bạn.</p>
                    <p style={{ fontSize: 14 }}>Hãy gửi mã cho bạn bè ngay nhé!</p>
                </div>
            ) : (
                <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                    {claims.map((c, idx) => (
                        <li
                            key={c.id || idx}
                            onClick={() => handleViewProfile(c.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img
                                    src={c.avatar_url || defaultAva}
                                    alt="ava"
                                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => { e.currentTarget.src = defaultAva }}
                                />
                                <div>
                                    <div style={{ fontWeight: 700, color: '#333' }}>
                                        {getDisplayName(c)}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888' }}>
                                        {c.joined_at ? `Tham gia: ${new Date(c.joined_at).toLocaleDateString('vi-VN')}` : `ID: ${c.id}`}
                                    </div>
                                </div>
                            </div>
                            <div style={{ color: '#ccc' }}>›</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}