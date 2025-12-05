import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../api/profile'
import { getInvite, getInviteClaims } from '../api/invite'
import copyIcon from '../public/copy.png'
import backIcon from '../public/back.png'

export default function Invite(){
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [claims, setClaims] = useState([])
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    let mounted = true
    // Request invite info from backend which returns { my_referral_code, invitees, referral_count, ... }
    Promise.allSettled([getInvite(), getProfile()])
      .then(results => {
        if (!mounted) return
        const [inviteRes, profileRes] = results

        if (inviteRes.status === 'fulfilled' && inviteRes.value && inviteRes.value.data) {
          const d = inviteRes.value.data
          if (d.my_referral_code) setCode(d.my_referral_code)
          if (Array.isArray(d.invitees)) setClaims(d.invitees)
        }

        // fallback to profile field if backend doesn't provide invite-info
        if ((!code || code === '') && profileRes.status === 'fulfilled' && profileRes.value && profileRes.value.data) {
          const u = profileRes.value.data
          if (u.invite_code) setCode(u.invite_code)
          if (Array.isArray(u.invited_users)) setClaims(u.invited_users)
        }

        setLoading(false)
      }).catch(err=>{
        if (!mounted) return
        setError(err)
        setLoading(false)
      })

    return ()=>{ mounted = false }
  }, [])

  const copyToClipboard = async () => {
    if (!code) {
      setToast('Không có mã để sao chép')
      setTimeout(() => setToast(null), 2500)
      return
    }

    // try navigator.clipboard first, fallback to execCommand
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code)
      } else {
        // fallback: create a hidden textarea and execCommand
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

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="loading">Không tải được nội dung. Vui lòng thử lại.</div>

  return (
    <div className="page-anim profile-page" style={{padding: '20px'}}>
      <button onClick={() => navigate(-1)} style={{border:'none',background:'transparent',padding:0,marginBottom:12}}>
        <img src={backIcon} alt="Back" style={{width:28,height:28}} />
      </button>

      <h2>Mời bạn</h2>
      <p style={{color:'#666'}}>Chia sẻ mã mời để bạn bè nhận quà và bạn nhận thưởng.</p>

      <div style={{display:'flex',alignItems:'center',gap:12,marginTop:20}}>
        <div style={{padding:16,background:'#fff',borderRadius:12,boxShadow:'0 4px 12px rgba(0,0,0,0.08)',flex:1,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:2}}>{code || '—'}</div>
          <button onClick={copyToClipboard} style={{border:'none',background:'transparent',cursor:'pointer'}} title="Sao chép">
            <img src={copyIcon} alt="Copy" style={{width:28,height:28}} />
          </button>
        </div>
      </div>

      {toast && (
        <div aria-live="polite" style={{position:'fixed',right:20,top:84,background:'#233',color:'#fff',padding:'10px 14px',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,0.18)'}}>
          {toast}
        </div>
      )}

      <h3 style={{marginTop:28}}>Người đã lấy mã của bạn</h3>
      {(!claims || claims.length === 0) ? (
        <p style={{color:'#888'}}>Chưa có ai sử dụng mã của bạn.</p>
      ) : (
        <ul style={{paddingLeft:0,listStyle:'none'}}>
          {claims.map((c, idx) => (
            <li key={c.id || idx} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #eee'}}>
              <div>
                <div style={{fontWeight:700}}>{c.name || c.full_name || c.username || 'Người dùng'}</div>
                <div style={{fontSize:12,color:'#888'}}>{c.email || c.phone || (c.claimed_at ? new Date(c.claimed_at).toLocaleString() : '')}</div>
              </div>
              <div style={{fontSize:12,color:'#666'}}>{c.claimed_at ? new Date(c.claimed_at).toLocaleDateString() : ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
