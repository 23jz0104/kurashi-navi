import React from "react";
import { Camera, ArrowLeft } from "lucide-react";
import "../../index.css"
import "../../styles/DataInput/CameraInput.css";
import Layout from "../../components/common/Layout";

const CameraInput = () => {
  return (
    <Layout 
     headerContent={
      <p>カメラ</p>
     }
      mainContent={
        <div className="camera-container">
          <div className="floating-buttons">
            <div className="button-wrapper">
              <div className="left-section">
                <button className="back-button">
                  <ArrowLeft />
                </button>
              </div>

              <div className="center-section">
                <button className="camera-button">
                  <div className="camera-button-inner">
                    <Camera />
                  </div>
                </button>
              </div>

              <div className="right-section">
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}

export default CameraInput;