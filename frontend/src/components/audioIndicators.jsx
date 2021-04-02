import React, { Component } from "react";
import {
  Mic,
  MicMute,
  MicFill,
  MicMuteFill,
  Megaphone,
  MegaphoneFill,
} from "react-bootstrap-icons";

class AudioIndicators extends Component {
  static MicOn = () => {
    return <MicFill className="px-2" size={60} />;
  };

  static MicOff = () => {
    return <MicMute className="px-2" size={60} />;
  };

  static MegaOn = () => {
    return <MegaphoneFill className="px-2" size={60} />;
  };

  static MegaOff = () => {
    return <Megaphone className="px-2" size={60} />;
  };
}

export default AudioIndicators;
