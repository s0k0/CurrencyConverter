import React from 'react';
import { render } from '@testing-library/react';
import Converter from './converter';

test('renders converter component', () => {
  const { getByText } = render(<Converter />);
  const converterHeadline = getByText(/exchange credit/i);
  expect(converterHeadline).toBeInTheDocument();
});

