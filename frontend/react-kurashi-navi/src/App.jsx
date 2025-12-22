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
// import Ninsyo from "./components/common/Ninsyo";
import History from "./pages/History/History";
import ManualInputData from "./pages/DataInput/ManualInput.jsx";
import ConfirmInputData from "./pages/DataInput/ConfirmInputData.jsx";
import CameraInput from "./pages/DataInput/CameraInput.jsx";
import BudgetEdit from "./components/BudgetManagement/BudgetEdit.jsx";
import BudgetCreate from "./components/BudgetManagement/BudgetCreate.jsx";
import FixedCostCreate from "./components/BudgetManagement/FixedCostCreate.jsx";  
import FixedCostEdit from "./components/BudgetManagement/FixedCostEdit.jsx";

function App() {
  return (
    <Router basename="/combine_test/">
    {/* <Router basename="/debug/"> */}
      <Routes>

        <Route path="/" element={<Log />} />
        <Route path="/log" element={<Log />} />
        <Route path="/newlog" element={<NewLog />} />

        <Route path="/mypage" element={<MyPage />} />
        <Route path="/dataInput" element={<ManualInputData />} />
        <Route path="/camera" element={<CameraInput />} />
        <Route path="/confirmInputData" element={<ConfirmInputData />} />
        <Route path="/userinfo" element={<UserInfo />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/notificationlist" element={<NotificationList />} />
        <Route path="/priceInfo/:productName" element={<PriceInfo />} />
        <Route path="/budget-management" element={<BudgetManagement />} />
        <Route path="/budget-management/create" element={<BudgetCreate />} />
        <Route path="/budget-management/edit" element={<BudgetEdit />} />
        <Route path="/budget-management/fixed-cost-create" element={<FixedCostCreate />} />
        <Route path="/budget-management/fixed-cost-edit" element={<FixedCostEdit />} />
        <Route path="/history" element={<History />} />
        <Route path="/Setting" element={<Setting />} />
      </Routes>
    </Router>
  );
}

export default App;