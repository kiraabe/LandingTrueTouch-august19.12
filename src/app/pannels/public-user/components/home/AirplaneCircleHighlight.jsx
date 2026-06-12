import { useEffect } from 'react';
import './airplane-highlight.css';

function AirplaneCircleHighlight({ children, className = '' }) {
  useEffect(() => {
    const path = document.querySelector('.circle-svg .ring');
    if (path) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
    }
  }, []);

  return (
    <span className={`marker-wrap ${className}`}>
      {children}
      <svg className="circle-svg" viewBox="0 0 210 95" xmlns="http://www.w3.org/2000/svg">
        <path
          className="ring"
          d="
            M 25,10
            C 42,-3 110,-6 158,7
            C 188,16 205,32 198,48
            C 190,66 155,80 100,82
            C 60,84 22,75 8,58
            C -6,40 4,16 25,10
            C 36,7 50,5 65,4.5
            C 90,2 130,4 150,12
          "
        />

        <circle className="smoke smoke-1" cx="40" cy="3" r="3.5" />
        <circle className="smoke smoke-2" cx="90" cy="2" r="4" />
        <circle className="smoke smoke-3" cx="150" cy="9" r="4.5" />
        <circle className="smoke smoke-4" cx="192" cy="35" r="5" />
        <circle className="smoke smoke-5" cx="160" cy="70" r="5.5" />

        <g className="plane" transform="scale(1.15)">
          <path
            d="
              M 11,0
              L 2,-1.2
              L -1,-5
              L -2.6,-5
              L -1,-1.4
              L -7,-1.4
              L -9,-4
              L -10.4,-4
              L -9.4,-1.2
              L -10.6,-0.9
              L -10.6,0.9
              L -9.4,1.2
              L -10.4,4
              L -9,4
              L -7,1.4
              L -1,1.4
              L -2.6,5
              L -1,5
              L 2,1.2
              Z
            "
            fill="#e05c1a"
          />
        </g>
      </svg>
    </span>
  );
}

export default AirplaneCircleHighlight;
