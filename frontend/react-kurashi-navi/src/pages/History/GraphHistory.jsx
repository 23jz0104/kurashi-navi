import { useState } from "react";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import CustomDatePicker from "../../components/common/DayPicker";
import { ChartPie, CalendarDays } from 'lucide-react';

const GraphHistory = () => {
	const [activeTab, setActiveTab] = useState("graph");

	const tabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> }
  ];

	const handleTabChange = (tab) => {
		setActiveTab(tab);
	}

	return(
		<Layout 
			headerContent={
				<TabButton 
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={handleTabChange}
				/>
			}
			mainContent={
				<div>
					<CustomDatePicker />
				</div>
			}
		/>
	)
}

export default GraphHistory;