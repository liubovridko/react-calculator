import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import FormulaInput from './components/formulaInput';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormulaInput />
    </QueryClientProvider>
  );
}

export default App;
