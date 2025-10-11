// components/OptimizedAnalogClock.js

"use client";

import { useRef, useEffect } from 'react';

let clockRadius = 0;
let lastUpdate = 0;

const drawClock = (ctx, time, width, height) => {
	clockRadius = Math.min(width, height) / 2 - 10;

	const hours = time.getHours();
	const mins = time.getMinutes();
	const secs = time.getSeconds();

	const cx = width / 2;
	const cy = height / 2;

	// Очередь мелких очисток
	ctx.clearRect(cx - clockRadius, cy - clockRadius, clockRadius * 2, clockRadius * 2);

	// Рисуем ободок и фон
	ctx.beginPath();
	ctx.arc(cx, cy, clockRadius, 0, 2 * Math.PI);
	ctx.lineWidth = 3;
	ctx.strokeStyle = '#415b6dff';
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(cx, cy, clockRadius - 6, 0, 2 * Math.PI);
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#415b6dff';
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(cx, cy, clockRadius - 7, 0, 2 * Math.PI);
	ctx.fillStyle = '#fffffcff';
	ctx.fill();

	// Минутные и часовые деления
	for (let i = 0; i < 60; i++) {
		const angle = ((Math.PI / 30) * i) - Math.PI / 2;
		const len = i % 5 === 0 ? 10 : 5;
		const xStart = cx + (clockRadius - 10) * Math.cos(angle);
		const yStart = cy + (clockRadius - 10) * Math.sin(angle);
		const xEnd = cx + (clockRadius - 10 - len) * Math.cos(angle);
		const yEnd = cy + (clockRadius - 10 - len) * Math.sin(angle);
		ctx.beginPath();
		ctx.moveTo(xStart, yStart);
		ctx.lineTo(xEnd, yEnd);
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	// Числа на циферблате
	ctx.font = "16px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#333";
	for (let i = 1; i <= 12; i++) {
		const angle = ((Math.PI / 6) * i) - Math.PI / 2;
		const x = cx + (clockRadius - 30) * Math.cos(angle);
		const y = cy + (clockRadius - 30) * Math.sin(angle);
		ctx.fillText(i, x, y);
	}

	// Окно с датой
	ctx.fillStyle = "#f2f2f2";
	roundRect(ctx, cx - 35, cy + 12, 70, 18, 3); // 3 — радиус закругления углов
	ctx.fill();

	// Рамка вокруг окна
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#333";
	ctx.stroke();

	ctx.fillStyle = "#333";
	ctx.font = "12px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(time.toLocaleDateString(), cx, cy + 22);

	// Стрелки часов
	ctx.beginPath();
	ctx.moveTo(cx, cy);
	ctx.lineTo(
		cx + (clockRadius - 20) * Math.sin(secs * 6 * Math.PI / 180),
		cy - (clockRadius - 20) * Math.cos(secs * 6 * Math.PI / 180)
	);
	ctx.strokeStyle = "#FF0000";
	ctx.lineWidth = 2;
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(cx, cy);
	ctx.lineTo(
		cx + (clockRadius - 30) * Math.sin(mins * 6 * Math.PI / 180),
		cy - (clockRadius - 30) * Math.cos(mins * 6 * Math.PI / 180)
	);
	ctx.strokeStyle = "#333";
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(cx, cy);
	ctx.lineTo(
		cx + (clockRadius - 40) * Math.sin((hours % 12 + mins / 60) * 30 * Math.PI / 180),
		cy - (clockRadius - 40) * Math.cos((hours % 12 + mins / 60) * 30 * Math.PI / 180)
	);
	ctx.strokeStyle = "#333";
	ctx.stroke();

	// Круг в центре циферблата
	ctx.beginPath();
	ctx.arc(cx, cy, 4, 0, 2 * Math.PI); // центральный круг радиусом 5 пикселей
	ctx.fillStyle = '#415b6dff'; // цвет заливки круга
	ctx.fill(); // рисуем круг
};

// Вспомогательная функция для рисования прямоугольника с закруглёнными углами
function roundRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y); // старт от верхнего правого угла
	ctx.lineTo(x + width - radius, y); // прямая вдоль верхней грани
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius); // закругление правого верхнего угла
	ctx.lineTo(x + width, y + height - radius); // прямая вдоль правой грани
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // закругление правого нижнего угла
	ctx.lineTo(x + radius, y + height); // прямая вдоль нижней грани
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius); // закругление левого нижнего угла
	ctx.lineTo(x, y + radius); // прямая вдоль левой грани
	ctx.quadraticCurveTo(x, y, x + radius, y); // закругление левого верхнего угла
	ctx.closePath();
}

const OptimizedAnalogClock = () => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const animationLoop = () => {
			requestAnimationFrame(animationLoop);
			const now = performance.now();
			if (now - lastUpdate > 1000 / 60) {
				const canvas = canvasRef.current;
				if (canvas) {
					const ctx = canvas.getContext("2d");
					if (ctx) {
						const { width, height } = canvas.parentElement.getBoundingClientRect();
						canvas.width = 300;
						canvas.height = 300;
						drawClock(ctx, new Date(), width, height);
					}
				}
				lastUpdate = now;
			}
		};

		animationLoop();

		return () => { };
	}, []);

	return <canvas ref={canvasRef} />;
};

export default OptimizedAnalogClock;
