import React, { useState, useRef, useEffect } from 'react'
import crownIcon from '../public/crown.png'
import { baseURL } from '../api/apiClient'

export default function BadgeCard({ badge, unlocked, onClick, className = '' }) {
    const cost = badge.threshold || 0

    const [shaking, setShaking] = useState(false)
    const [imgError, setImgError] = useState(false) // <--- 1. THÊM STATE ĐỂ BẮT LỖI ẢNH

    // Reset lỗi ảnh khi badge thay đổi
    useEffect(() => {
        setImgError(false)
    }, [badge])

    // Rotation state (degrees around Y axis)
    const [rotation, setRotation] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    const draggingRef = useRef(false)
    const startXRef = useRef(0)
    const startRotationRef = useRef(0)
    const movedRef = useRef(false)

    const SENSITIVITY = 0.9

    const handleClick = () => {
        if (movedRef.current) return

        if (unlocked) {
            if (onClick) onClick(badge)
            return
        }
        try {
            setShaking(true)
            setTimeout(() => setShaking(false), 420)
        } catch (e) {
            setShaking(false)
        }
    }

    const onPointerMove = (e) => {
        if (!draggingRef.current) return
        const clientX = (e && e.clientX) || (e && e.touches && e.touches[0] && e.touches[0].clientX) || 0
        const delta = clientX - startXRef.current
        if (Math.abs(delta) > 3) movedRef.current = true
        const newRotation = startRotationRef.current + delta * SENSITIVITY
        setRotation(newRotation)
    }

    const onPointerUp = (e) => {
        if (!draggingRef.current) return
        draggingRef.current = false
        setIsDragging(false)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        if (!movedRef.current) {
            handleClick()
        }
        movedRef.current = false
    }

    useEffect(() => {
        return () => {
            if (draggingRef.current) {
                window.removeEventListener('pointermove', onPointerMove)
                window.removeEventListener('pointerup', onPointerUp)
            }
        }
    }, [])

    // 2. LOGIC TẠO URL ẢNH MỚI (CHẶT CHẼ HƠN)
    const getImageUrl = (imgName) => {
        if (!imgName) return null
        const s = String(imgName)
        if (s.startsWith('http')) return s

        // Xử lý trường hợp baseURL có hoặc không có dấu gạch chéo cuối
        const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL

        // Nếu imgName bắt đầu bằng /, nối trực tiếp vào base
        if (s.startsWith('/')) return `${base}${s}`

        // Trường hợp còn lại (tên file "01.png"), nối vào folder badges
        return `${base}/badges/${s}`
    }

    const imgSrc = getImageUrl(badge?.image)

    return (
        <div
            className={`badge-card ${unlocked ? 'unlocked' : 'locked'} ${shaking ? 'shake' : ''} ${className}`}
            onPointerDown={(e) => {
                draggingRef.current = true
                movedRef.current = false
                startXRef.current = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0
                startRotationRef.current = rotation
                setIsDragging(true)
                window.addEventListener('pointermove', onPointerMove)
                window.addEventListener('pointerup', onPointerUp)
            }}
        >
            <div className="stamp" style={{ transform: `rotateY(${rotation}deg)`, transition: isDragging ? 'none' : 'transform 360ms ease-out', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>

                {/* 3. CHỈ HIỆN ẢNH NẾU CÓ SRC VÀ CHƯA BỊ LỖI */}
                {imgSrc && !imgError ? (
                    <img
                        src={imgSrc}
                        alt={badge.badge || 'badge'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        // Bắt sự kiện lỗi để ẩn ảnh đi, hiện fallback
                        onError={() => setImgError(true)}
                    />
                ) : (
                    // Fallback UI (Tem chữ cái)
                    <div className="stamp-inner">{badge.badge ? badge.badge.charAt(0) : '🏅'}</div>
                )}

                {badge && badge.rare && (
                    <img src={crownIcon} alt="rare" className="badge-crown" />
                )}
            </div>
            <div className="badge-meta">
                <div className="badge-title">{badge.badge}</div>
                <div className="badge-cost">{cost} pts</div>
            </div>
        </div>
    )
}