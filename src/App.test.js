import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders converter component', () => {
  const { getByText } = render(<App />);
  const converterHeadline = getByText(/exchange credit/i);
  expect(converterHeadline).toBeInTheDocument();
});
