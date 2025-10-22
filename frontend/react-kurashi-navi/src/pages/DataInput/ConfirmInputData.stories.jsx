import ConfirmInputData from "./ConfirmInputData";
import { MemoryRouter, Routes, Route } from "react-router-dom";

export default {
	title: 'DataInput/ConfirmInputData',
	component: ConfirmInputData,
};

export const Default = () => {
	return (
		<MemoryRouter initialEntries={["/confirm-input-data"]}>
			<Routes>
				<Route path="/confirm-input-data" element={<ConfirmInputData />}/>
			</Routes>
		</MemoryRouter>
	);
};