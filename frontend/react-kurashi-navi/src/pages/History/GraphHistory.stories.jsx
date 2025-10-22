import GraphHistory from './GraphHistory';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Pages/GraphHistory',
  component: GraphHistory,
};

export const Default = () => (
  <MemoryRouter>
    <GraphHistory />
  </MemoryRouter>
);