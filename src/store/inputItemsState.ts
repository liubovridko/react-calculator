import { create } from 'zustand';

interface InputValueState {
  inputValue: string;
  inputValues: any[];
  setInputValue: (value: string) => void;
  addInputValue: (value: any) => void;
  removeInputValue: (index: number) => void;
  editInputValue: (index: number, value: any) => void;
  setFullInputValue: (values: any[]) => void;
}

const useStore = create<InputValueState>((set) => ({
  inputValue: '',
  inputValues: [],
  setInputValue: (value) => set({ inputValue: value }),
  addInputValue: (value) => set((state) => ({ inputValues: [...state.inputValues, value] })),
  removeInputValue: (index) =>
    set((state) => ({
      inputValues: state.inputValues.filter((_, i) => i !== index),
    })),
  editInputValue: (index, value) =>
    set((state) => ({
      inputValues: state.inputValues.map((item, i) => (i === index ? value : item)),
    })),
  setFullInputValue: (values) => set({ inputValues: values }),
}));

export default useStore;
