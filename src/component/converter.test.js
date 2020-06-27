import React from 'react';
import { render } from '@testing-library/react';
import Converter from './converter';

test('renders converter component', () => {
  const container = render(<Converter />);
  expect(container).toMatchSnapshot()
});

