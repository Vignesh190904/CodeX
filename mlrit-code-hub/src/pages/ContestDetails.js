import React from 'react';
import './ContestDetails.css';

const ContestDetails = ({ contest }) => {
  return (
    <div className="contest-details">
      <h2>{contest.title}</h2>
      <p>{contest.description}</p>
      <div className="contest-info">
        <div>Start Time: {new Date(contest.startTime).toLocaleString()}</div>
        <div>End Time: {new Date(contest.endTime).toLocaleString()}</div>
        <div>Duration: {contest.duration} minutes</div>
      </div>
    </div>
  );
};

export default ContestDetails;
