import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react'
import { listPlaces } from '../api/map'

const PINS = [
  { id: 1, lat: 10.7769, lng: 106.7009, image: '/src/public/Map/dkhi.png', checkInRate: '46%', title: 'Đảo Khỉ', desc: 'Đảo Khỉ Cần Giờ là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và khám phá thế giới động vật hoang dã. Chỉ cách trung tâm Sài Gòn khoảng 50km, đảo Khỉ Cần Giờ thu hút du khách bởi hàng nghìn chú khỉ tinh nghịch cùng không gian rừng ngập mặn xanh mát, yên bình.' },
  { id: 2, lat: 10.7626, lng: 106.6822, title: 'Bến Nghé', desc: 'Historic riverside area' },
  { id: 3, lat: 10.7554, lng: 106.6753, title: 'Mai Chí Thọ', desc: 'Modern boulevard' },
]

export default function CheckIn() {
  const { locationId } = useParams();  // e.g., "hanoi" or "danang"
  const location = PINS.find(p => p.id === Number(locationId));
  return (
    <div>
      <h1>Check-In Page</h1>
      <p>You are checking in at: {location.title}</p>
    </div>
  );
}