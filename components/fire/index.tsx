import { FirePropsType } from "./types";

export default function Fire(props: FirePropsType) {
  return (
    <div className="fire">
      {[...Array(60).keys()].map((n, k) => (
        <div key={`pcl-${k}`} className="particle"></div>
      ))}
      <style jsx>{`
        .fire {
          font-size: 24px;
          filter: blur(${props.blur ? props.blur : 0.48}px);
          -webkit-filter: blur(${props.blur ? props.blur : 0.48}px);
          margin: 3em auto 0 auto;
          position: relative;
          width: ${props.width ? props.width : 55}px;
          height: ${props.height ? `${props.height}px` : "auto"};
        }
        .particle {
          animation: rise ${props.duration ? props.duration : 1}s ease-in
            infinite;
          background-image: radial-gradient(
            ${props.fireColor ? props.fireColor : "rgb(255, 80, 0)"} 20%,
            ${props.fireColorT ? props.fireColorT : "rgba(255, 80, 0, 0)"} 70%
          );
          border-radius: 50%;
          mix-blend-mode: screen;
          opacity: 0;
          position: absolute;
          bottom: 0;
          width: ${props.partSize ? props.partSize : 30}px;
          height: ${props.partSize ? props.partSize : 30}px;
        }

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          25% {
            opacity: 1;
          }
          to {
            opacity: 0;
            transform: translateY(-${props.height ? props.height * 3 : 60}px)
              scale(0);
          }
        }
      `}</style>
      <style jsx>{`
        ${[...Array(60).keys()]
          .map(
            (k) =>
              `.particle:nth-of-type(${k + 1}){animation-delay: ${
                Math.random() * (props.duration ? props.duration : 1)
              }s;left: calc((100% - ${
                props.partSize ? props.partSize : 30
              }px) * ${k / (props.parts ? props.parts : 30)});}`
          )
          .join("")}
      `}</style>
    </div>
  );
}
