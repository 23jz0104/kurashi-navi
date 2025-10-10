import { useNavigate } from "react-router-dom";
import { Camera, ArrowLeft } from "lucide-react";
import { useRef } from "react";
import "../../index.css"
import styles from "../../styles/DataInput/CameraInput.module.css";
import Layout from "../../components/common/Layout";

const CameraInput = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleCameraChange = (event) => {
    const file = event.target.files?.[0];
    if(file) {
      console.log(file.name);
      navigate("/confirm-input-data", { state: { file: file }});
    }
  }

  return (
    <Layout 
      headerContent={
        <p>カメラ</p>
      }
      mainContent={
        <div className={styles["camera-container"]}>
          <input
            ref={fileInputRef} 
            type="file"
            accept="image/*" //画像のみを許可する
            capture="environment" //スマホの場合は背面カメラを起動
            onChange={handleCameraChange} //ファイルが選択された後に関数を実行
            style={{ display: 'none' }}
          />
          <div className={styles["floating-buttons"]}>
            <div className={styles["button-wrapper"]}>
              <div className={styles["left-section"]}>
                <button className={styles["back-button"]}>
                  <ArrowLeft />
                </button>
              </div>

              <div className={styles["center-section"]}>
                <button
                  className={styles["camera-button"]}
                  onClick={handleCameraClick}
                >
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