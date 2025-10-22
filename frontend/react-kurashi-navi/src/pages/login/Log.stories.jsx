import React from "react";
import Log from "./Log";
import { BrowserRouter } from "react-router-dom";

export default {
  title: "Example/Log",
  component: Log,
};

export const Default = () => (
  <BrowserRouter>
    <Log active={0} onNavigate={() => {}} />
  </BrowserRouter>
);
