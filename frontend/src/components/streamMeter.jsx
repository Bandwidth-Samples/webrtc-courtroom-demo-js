import React, { useRef, useEffect, useState } from "react";
import attach from "../services/volume_meter";

const StreamMeter = (props) => {
  // console.log("in StreamMeter - Props:", props);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    // console.log("in StreamMeter useEffect", canvasRef, canvas);

    if (!(canvas && props.mediaStream)) {
      console.log("in StreamMeter - returning because of null props");
      return;
    } else {
      attach(canvas, props.mediaStream);
    }
  }, []);

  return <canvas id={props.streamId} ref={canvasRef} height="30" />;
};

export default StreamMeter;
