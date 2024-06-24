import React, { useEffect, useState } from 'react';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import useFormulaInput from '../hooks/useFormulaInput';
import { Box, List, ListItem, ListItemText, TextField, Chip } from '@mui/material';
import useStore from '../store/inputItemsState';
import _debounce from 'lodash/debounce';
import { evaluate, parse } from 'mathjs';

const dummyVariables = {
  x: 5,
  y: 10,
  z: 2,
};

interface Tag {
  name: string;
  value: string | number;
}

function FormulaInput() {
  const { autocompleteSuggestions } = useFormulaInput();
  const { inputValue, inputValues, setInputValue, setFullInputValue, removeInputValue, addInputValue } = useStore();
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [result, setResult] = useState<number | string | null>(null);

  const handleInputChangeDebounced = _debounce((value: string) => {
    setInputValue(value);
  }, 100);

  const checkOperand = (value: string) => {
    return ['+', '-', '*', '/', '^', '(', ')'].includes(value);
  };

  const handleTagsChange = (tags: (string | Tag)[]) => {
    setFullInputValue(tags);
  };

  const handleOnSelect = (item: Tag) => {
    if (editIndex !== -1) {
      const newInputValues = [...inputValues];
      newInputValues[editIndex] = { name: item.name, value: item.value };
      setFullInputValue(newInputValues);
      setEditIndex(-1);
    } else {
      addInputValue({ name: item.name, value: item.value });
    }
    setIsAutocompleteOpen(false);
    setInputValue('');
  };

  const handleTagClick = (index: number) => {
    setEditIndex(index);
    setIsAutocompleteOpen(true);
    setInputValue((inputValues[index] as Tag).name);
  };

  const handleEditConfirm = (index: number) => {
    if (inputValue.trim()) {
      const newInputValues = [...inputValues];
      newInputValues[index] = { name: inputValue, value: inputValue };
      setFullInputValue(newInputValues);
    }
    setEditIndex(-1);
    setInputValue('');
    setIsAutocompleteOpen(false);
  };

  const handleInsertBetweenTags = () => {
    if (inputValue.trim()) {
      if (checkOperand(inputValue)) {
        addInputValue(inputValue);
      } else {
        addInputValue({ name: inputValue, value: inputValue });
      }
      setIsAutocompleteOpen(false);
      setInputValue('');
    }
  };

  const isValidFormula = (formula: string) => {
    const lastChar = formula.trim().slice(-1);
    return !['+', '-', '*', '/', '^', '('].includes(lastChar);
  };

  useEffect(() => {
    const formula = inputValues
      .map((item) => {
        if (typeof item === 'string') return item;
        const tag = item as Tag;
        return dummyVariables.hasOwnProperty(tag.name) ? tag.name : tag.value;
      })
      .join(' ');

    console.log('Formula:', formula);

    if (isValidFormula(formula)) {
      try {
        const node = parse(formula);
        const code = node.compile();
        const evalResult = code.evaluate(dummyVariables);
        setResult(evalResult);
      } catch (error) {
        console.error('Error evaluating formula:', error);
        setResult('Error');
      }
    } else {
      setResult('Invalid formula');
    }
  }, [inputValues]);

  const renderTag = ({
    tag,
    key,
    disabled,
    onRemove,
    getTagDisplayValue,
  }: {
    tag: string | Tag;
    key: number;
    disabled: boolean;
    onRemove: (key: number) => void;
    getTagDisplayValue: (tag: string | Tag) => string;
  }) => {
    if (typeof tag === 'string' && checkOperand(tag)) {
      return (
        <span key={key} style={{ margin: '2px' }}>
          {tag}
        </span>
      );
    }
    const displayValue = typeof tag === 'object' ? tag.name : tag;
    return (
      <Chip
        key={key}
        label={getTagDisplayValue(displayValue)}
        onDelete={() => onRemove(key)}
        onClick={() => handleTagClick(key)}
        color="primary"
        variant="outlined"
        style={{ margin: '2px' }}
      />
    );
  };

  return (
    <Box mx="auto" mt={10} maxWidth={600}>
      <TagsInput
        value={inputValues.map((item) => (typeof item === 'object' && (item as Tag).name ? (item as Tag).name : item))}
        onChange={handleTagsChange}
        renderInput={({ addTag, ...inputProps }) => (
          <TextField
            {...inputProps}
            label="Formula Input"
            variant="outlined"
            fullWidth
            style={{marginTop:'10px'}}
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              handleInputChangeDebounced(value);
              if (!checkOperand(value)) {
                setIsAutocompleteOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (editIndex !== -1) {
                  handleEditConfirm(editIndex);
                } else {
                  handleInsertBetweenTags();
                }
              }
              if (e.key === 'Backspace') {
                if (inputValue === '' && editIndex !== -1) {
                  e.preventDefault();
                  setEditIndex(-1);
                } else if (inputValue === '' && inputValues.length > 0) {
                  removeInputValue(inputValues.length - 1);
                }
              }
            }}
          />
        )}
        renderTag={renderTag}
      />
      {autocompleteSuggestions && isAutocompleteOpen && (
        <List>
          {autocompleteSuggestions.map((suggestion, index) => (
            <ListItem button key={index} onClick={() => handleOnSelect(suggestion)}>
              <ListItemText primary={suggestion.name} />
            </ListItem>
          ))}
        </List>
      )}
      {result != null && (
        <Box mt={2}>
          <TextField
            label="Result"
            variant="outlined"
            value={result.toString()}
            fullWidth
            inputProps={{
              readOnly: true,
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default FormulaInput;
