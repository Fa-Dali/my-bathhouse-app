// components/StyledCalendar.jsx
import styled from 'styled-components';
import Calendar from 'react-calendar';

const StyledCalendar = styled(Calendar)`
  ${'' /* background-color: white; */}
  color: black;
  ${'' /* padding: 1rem; */}
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  ${'' /* border-radius: 10px; */}

  & .react-calendar__viewContainer {
    overflow-y: auto;
  }

  & .react-calendar__month-view__weekdays__weekday abbr {
    visibility: visible !important;
    opacity: 1;
  }

  & .react-calendar__tile--active {
    background-color: lightblue;
    color: white;
  }
`;

export default StyledCalendar;
