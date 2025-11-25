import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Log from "./pages/login/Log";
import NewLog from "./pages/login/NewLog";
import MyPage from "./pages/MyPages/MyPage";
import UserInfo from "./pages/MyPages/UserInfo";
import Statistics from "./pages/mypages/Statistics";
import NotificationList from "./pages/Notifications/NotificationList";
import PriceInfo from "./pages/Notifications/PriceInfo.jsx";
import BudgetControl from "./pages/Budget/BudgetControl";
import Ninsyo from "./components/common/Ninsyo";
import History  from "./pages/History/History";
import ConfirmInputData from "./pages/DataInput/ManualInput";

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
        <Route path="/dataInput" element={<Ninsyo><ConfirmInputData /></Ninsyo>} />
        <Route path="/userinfo" element={<Ninsyo><UserInfo /></Ninsyo>} />
        <Route path="/statistics" element={<Ninsyo><Statistics /></Ninsyo>} />
        <Route path="/notificationlist" element={<Ninsyo><NotificationList /></Ninsyo>} />
        <Route path="/priceInfo/:productName" element={<Ninsyo><PriceInfo /></Ninsyo>} />
        <Route path="/budgetcontrol" element={<Ninsyo><BudgetControl /></Ninsyo>} />
        <Route path="/history" element={<Ninsyo><History /></Ninsyo>} />
      </Routes>
    </Router>
  );
}

export default App;
