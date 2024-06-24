import { useQuery } from 'react-query';
import useStore from '../store/inputItemsState';


interface AutocompleteItem {
   name: string;
   category: string;
   value: string | number; 
   id: string;
 }


function useFormulaInput() {
  const { inputValue } = useStore();

  const { data: autocompleteSuggestions = [], isLoading, error } = useQuery<AutocompleteItem[]>(
   ['autocomplete', inputValue],
   async () => {
     try {
       const response = await fetch(`https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete?search=${inputValue}`);
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       return response.json();
     } catch (error) {
       console.error('Error fetching autocomplete suggestions:', error);
       return [];
     }
   },
   { 
    enabled: Boolean(inputValue),
    staleTime: 2000, 
   }
 );

   if (error) {
   console.error('Error:', error);
   }


  return {
    autocompleteSuggestions,
    error,
    isLoading
  };
}

export default useFormulaInput;
