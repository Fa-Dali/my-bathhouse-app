// components/CalendarWrapper.jsx
'use client';

import { useState, useEffect } from 'react';
import StyledCalendar from './StyledCalendar';
import '../styles/CalendarWrapper.css';

const CalendarWrapper = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return isLoaded ? (
    <div className="calendar-wrapper">
      <StyledCalendar />
    </div>
  ) : null;
};

export default CalendarWrapper;
