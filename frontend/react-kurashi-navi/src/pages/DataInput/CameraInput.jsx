import { Camera, ArrowLeft } from "lucide-react";
import "../../index.css"
import styles from "../../styles/DataInput/CameraInput.module.css";
import Layout from "../../components/common/Layout";

const CameraInput = () => {
  return (
    <Layout 
      headerContent={
        <p>カメラ</p>
      }
      mainContent={
        <div className={styles["camera-container"]}>
          <div className={styles["floating-buttons"]}>
            <div className={styles["button-wrapper"]}>
              <div className={styles["left-section"]}>
                <button className={styles["back-button"]}>
                  <ArrowLeft />
                </button>
              </div>

              <div className={styles["center-section"]}>
                <button className={styles["camera-button"]}>
                  <div className={styles["camera-button-inner"]}>
                    <Camera />
                  </div>
                </button>
              </div>

              <div className={styles["right-section"]}>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}

export default CameraInput;