import React from 'react';

const IframePage: React.FC = () => {
  return (
    <div className="iframe-container">
      <iframe
        src="http://localhost:3001" // gas-app의 URL
        title="Gas App"
        className="gas-app-iframe"
        width="100%"
        height="600px"
        frameBorder="0"
      />
    </div>
  );
};

export default IframePage;
