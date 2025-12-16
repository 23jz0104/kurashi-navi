import History from './History';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/History',
  component: History,
};

export const Default = () => (
  <MemoryRouter>
    <History />
  </MemoryRouter>
);