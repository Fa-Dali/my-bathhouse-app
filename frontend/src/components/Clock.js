// components/AnalogClock.js

"use client";

import { useRef, useEffect } from 'react';

const clockRadius = 100;

const drawClock = (ctx, time) => {
  const hours = time.getHours();
  const mins = time.getMinutes();
  const secs = time.getSeconds();

  ctx.clearRect(0, 0, clockRadius * 2, clockRadius * 2);

  // Фон циферблата (меняется каждые полчаса)
  let gradientColor = ['#ffffff', '#eeeeee'];
  ctx.beginPath();
  ctx.arc(clockRadius, clockRadius, clockRadius - 8, 0, 2 * Math.PI);
  ctx.fillStyle = gradientColor[(mins > 30 ? 1 : 0)];
  ctx.fill();

  // Поминутная градуировка циферблата
  for (let i = 0; i < 60; i++) {
    const angle = ((Math.PI / 30) * i) - Math.PI / 2;
    const len = i % 5 === 0 ? 10 : 5;
    const xStart = clockRadius + (clockRadius - 15) * Math.cos(angle);
    const yStart = clockRadius + (clockRadius - 15) * Math.sin(angle);
    const xEnd = clockRadius + (clockRadius - 15 - len) * Math.cos(angle);
    const yEnd = clockRadius + (clockRadius - 15 - len) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }

  // Часовые деления (жирнее линий минуты)
  for (let i = 0; i < 12; i++) {
    const angle = ((Math.PI / 6) * i) - Math.PI / 2;
    const xStart = clockRadius + (clockRadius - 15) * Math.cos(angle);
    const yStart = clockRadius + (clockRadius - 15) * Math.sin(angle);
    const xEnd = clockRadius + (clockRadius - 25) * Math.cos(angle);
    const yEnd = clockRadius + (clockRadius - 25) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }

  // Нарисовать числа на циферблате (шрифт изменяется каждую минуту)
  const fontSizes = ["16px Arial", "18px Times New Roman"];
  ctx.font = fontSizes[(secs > 30 ? 1 : 0)]; // Меняем шрифт каждый полминуты
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  for (let i = 1; i <= 12; i++) {
    const angle = ((Math.PI / 6) * i) - Math.PI / 2;
    const x = clockRadius + (clockRadius - 30) * Math.cos(angle);
    const y = clockRadius + (clockRadius - 30) * Math.sin(angle);
    ctx.fillText(i, x, y);
  }

  // Нарисовать стрелки часов
  ctx.beginPath();
  ctx.moveTo(clockRadius, clockRadius);
  ctx.lineTo(
    clockRadius + (clockRadius - 20) * Math.sin(secs * 6 * Math.PI / 180),
    clockRadius - (clockRadius - 20) * Math.cos(secs * 6 * Math.PI / 180)
  );
  ctx.strokeStyle = "#FF0000"; // Красная секундная стрелка
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(clockRadius, clockRadius);
  ctx.lineTo(
    clockRadius + (clockRadius - 30) * Math.sin(mins * 6 * Math.PI / 180),
    clockRadius - (clockRadius - 30) * Math.cos(mins * 6 * Math.PI / 180)
  );
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(clockRadius, clockRadius);
  ctx.lineTo(
    clockRadius + (clockRadius - 40) * Math.sin((hours % 12 + mins / 60) * 30 * Math.PI / 180),
    clockRadius - (clockRadius - 40) * Math.cos((hours % 12 + mins / 60) * 30 * Math.PI / 180)
  );
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // Окно с датой на циферблате
  ctx.fillStyle = "#f2f2f2";
  ctx.beginPath();
  ctx.rect(clockRadius - 40, clockRadius - 20, 80, 40);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(time.toLocaleDateString(), clockRadius, clockRadius);
};

const AnalogClock = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawClock(ctx, new Date());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <canvas ref={canvasRef} width={clockRadius * 2} height={clockRadius * 2} />;
};

export default AnalogClock;
