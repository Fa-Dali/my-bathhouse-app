// app/components/EscapingAvatar.tsx
'use client';

import { useAuth } from '@/app/auth/contexts/auth-provider';
import { useEffect, useRef, useState } from 'react';

export default function EscapingAvatar() {
  const { user } = useAuth();
  const avatarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const avatarSize = 60;
  const margin = 20;

  // Начальная позиция — справа внизу
  useEffect(() => {
    if (!user) return;

    const startX = window.innerWidth - avatarSize - margin;
    const startY = window.innerHeight - avatarSize - margin;
    setPosition({ x: startX, y: startY });
    setIsVisible(true);
  }, [user]);

  // Обработчик движения (мышка + тач)
  const handleMove = (clientX: number, clientY: number) => {
    if (!avatarRef.current) return;

    const rect = avatarRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 150) {
      const angle = Math.atan2(dy, dx);
      const moveX = -Math.cos(angle) * 20;
      const moveY = -Math.sin(angle) * 20;

      let newX = position.x + moveX;
      let newY = position.y + moveY;

      // Ограничиваем движение (остаёмся в правой части экрана)
      const minX = window.innerWidth * 0.8;
      const maxX = window.innerWidth - avatarSize - margin;
      const minY = margin;
      const maxY = window.innerHeight - avatarSize - margin;

      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      setPosition({ x: newX, y: newY });
    }
  };

  // Для мыши
  useEffect(() => {
    if (!user) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [position, user]);

  // Для сенсорных экранов
  useEffect(() => {
    if (!user) return;

    const handleTouchMove = (e: TouchEvent) => {
      // Берём первый палец (e.touches[0])
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [position, user]);

  if (!user || !isVisible) return null;

  // ✅ Безопасное формирование URL
  const avatarUrl = user.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `http://localhost:8000${user.avatar}`
    : '/default-avatar.png';

  return (
    <div
      ref={avatarRef}
      className="fixed z-50 cursor-pointer rounded-full border-2 border-white shadow-lg transition-transform duration-100 hover:scale-110"
      style={{
        left: position.x,
        top: position.y,
        width: avatarSize,
        height: avatarSize,
        backgroundImage: `url(${avatarUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: 'translate(-50%, -50%)',
      }}
      title={`Привет, ${user.first_name || user.username}!`}
      onClick={() => alert('Хватай, если сможешь!')}
    />
  );
}
