import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Log from "./pages/login/Log";
import NewLog from "./pages/login/NewLog";
import MyPage from "./pages/MyPages/MyPage";
import UserInfo from "./pages/MyPages/UserInfo";
import Statistics from "./pages/mypages/Statistics";
import Setting from "./pages/MyPages/Setting.jsx";
import NotificationList from "./pages/Notifications/NotificationList";
import PriceInfo from "./pages/Notifications/PriceInfo.jsx";
import BudgetManagement from "./pages/Budget/BudgetManagement.jsx";
import Ninsyo from "./components/common/Ninsyo";
import History  from "./pages/History/History";
import ManualInputData from "./pages/DataInput/ManualInput.jsx";
import ConfirmInputData from "./pages/DataInput/ConfirmInputData.jsx";
import CameraInput from "./pages/DataInput/CameraInput.jsx";
import BudgetEdit from "./components/BudgetManagement/BudgetEdit.jsx";
import BudgetCreate from "./components/BudgetManagement/BudgetCreate.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* 認証不要 */}
        <Route path="/" element={<Log />} />
        <Route path="/log" element={<Log />} />
        <Route path="/newlog" element={<NewLog />} />

        {/* 認証必要ページは Ninsyo でラップ */}
        <Route path="/mypage" element={<Ninsyo><MyPage /></Ninsyo>} />
        <Route path="/dataInput" element={<Ninsyo><ManualInputData /></Ninsyo>} />
        <Route path="/camera" element={<Ninsyo><CameraInput /></Ninsyo>} />
        <Route path="/confirmInputData" element={<Ninsyo><ConfirmInputData/></Ninsyo>} />
        <Route path="/userinfo" element={<Ninsyo><UserInfo /></Ninsyo>} />
        <Route path="/statistics" element={<Ninsyo><Statistics /></Ninsyo>} />
        <Route path="/notificationlist" element={<Ninsyo><NotificationList /></Ninsyo>} />
        <Route path="/priceInfo/:productName" element={<Ninsyo><PriceInfo /></Ninsyo>} />
        <Route path="/budget-management" element={<Ninsyo><BudgetManagement /></Ninsyo>} />
        <Route path="/budget-management/create" element={<Ninsyo><BudgetCreate /></Ninsyo>} />
        <Route path="budget-management/edit" element={<Ninsyo><BudgetEdit /></Ninsyo>} />
        <Route path="/history" element={<Ninsyo><History /></Ninsyo>} />
        <Route path="/Setting" element={<Ninsyo><Setting /></Ninsyo>} />
      </Routes>
    </Router>
  );
}

export default App;
