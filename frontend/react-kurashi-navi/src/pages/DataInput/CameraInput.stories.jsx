import { MemoryRouter, Routes, Route } from "react-router-dom";
import CameraInput from "./CameraInput";
import ConfirmInputData from "./ConfirmInputData";

export default {
  title: 'DataInput/CameraInput',
  component: CameraInput,
};

export const Default = () => (
  <MemoryRouter initialEntries={['/camera-input']}>
    <Routes>
      <Route path="/camera-input" element={<CameraInput />} />
      <Route path="/confirm-input-data" element={< ConfirmInputData/>} />
    </Routes>
  </MemoryRouter>
);