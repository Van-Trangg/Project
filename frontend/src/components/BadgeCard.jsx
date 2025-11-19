import React, { useState, useRef, useEffect } from 'react'
import crownIcon from '../public/crown.png'
import { baseURL } from '../api/apiClient'

export default function BadgeCard({ badge, unlocked, onClick, className = '' }){
  const cost = badge.threshold || 0

  const [shaking, setShaking] = useState(false)

  // Rotation state (degrees around Y axis)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startRotationRef = useRef(0)
  const movedRef = useRef(false)

  // Sensitivity: degrees per pixel (adjustable). Increase to make drag feel faster.
  const SENSITIVITY = 0.9

  const handleClick = () => {
    // Ignore synthetic click if we just dragged
    if (movedRef.current) return

    // If unlocked, perform the normal action
    if (unlocked) {
      if (onClick) onClick(badge)
      return
    }
    // If locked, trigger a shake to indicate it's not available
    try {
      setShaking(true)
      // stop shaking after animation (~420ms)
      setTimeout(() => setShaking(false), 420)
    } catch (e) {
      setShaking(false)
    }
  }

  // pointer move/up handlers (defined here so window listeners can remove them)
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
    // if it was a pure click (no meaningful movement), treat as click
    if (!movedRef.current) {
      handleClick()
    }
    movedRef.current = false
  }

  useEffect(() => {
    // cleanup in case component unmounts while dragging
    return () => {
      if (draggingRef.current) {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // image can be either:
  // - a full URL (starts with 'http'),
  // - an absolute public path (starts with '/'), e.g. '/back.png',
  // - or a filename served from /badges/<filename>
  const imgSrc = badge && badge.image
    ? (String(badge.image).startsWith('http')
        ? badge.image 
        : (String(badge.image).startsWith('/') 
            ? badge.image 
            : `${baseURL}/badges/${badge.image}`) 
      )
    : null

  return (
    <div
      className={`badge-card ${unlocked ? 'unlocked' : 'locked'} ${shaking ? 'shake' : ''} ${className}`}
      // pointer handlers implement drag-to-rotate and click detection
      onPointerDown={(e) => {
        // start dragging
        draggingRef.current = true
        movedRef.current = false
        startXRef.current = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0
        startRotationRef.current = rotation
        setIsDragging(true)
        // listen on window to capture moves outside element
        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
      }}
    >
      <div className="stamp" style={{ transform: `rotateY(${rotation}deg)`, transition: isDragging ? 'none' : 'transform 360ms ease-out', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={badge.badge || 'badge'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <div className="stamp-inner">{badge.badge ? badge.badge.charAt(0) : '🏅'}</div>
        )}
        {/* crown overlay for rare badges */}
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
