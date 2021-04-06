import React, { useRef, useEffect, useState } from "react";
import attach from "../services/volume_meter";

const StreamMeter = (props) => {
  console.log("in StreamMeter - Props:", props);

  const [mediaStream, setMediaStream] = useState(props.mediaStream);

  const canvasRef = useRef(null);

  //   const draw = (ctx) => {
  //     ctx.fillStyle = "#884433";
  //     ctx.fillRect(0, 0, props.width, 30);
  //   };

  useEffect(() => {
    const canvas = canvasRef.current;
    // const context = canvas.getContext("2d");
    console.log("in StreamMeter useEffect", canvasRef, canvas);

    if (!(canvas && mediaStream)) {
      console.log("in StreamMeter - returning because of null props");
      return;
    } else {
      attach(canvas, mediaStream);
    }
  }, []);

  return <canvas ref={canvasRef} height="30" />;
};

export default StreamMeter;
