import React from "react";
import ManualInput from "./ManualInput";
import { MemoryRouter, useLocation } from "react-router-dom";

export default {
  title: 'DataInput/ManualInput',
  component: ManualInput,
};

export const Default = () => (
  <MemoryRouter>
    <ManualInput />
  </MemoryRouter>
) 