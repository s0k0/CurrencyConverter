
import React from 'react';
import axios from 'axios';
import { render, waitForElement, fireEvent } from '@testing-library/react';
import Converter from './converter';

jest.mock('axios')

const rate = 1.1234
function mockCall() {
  axios.get.mockResolvedValueOnce({
    data: {
       base: 'GBP',
       rates: { EUR: rate}
    }
  });
} 

describe('Converter component', () => {

  test('renders converter component', () => {
    mockCall();
    const { container } = render(<Converter />);
    expect(container.firstChild).toMatchSnapshot()
  });

  test('should fetch rates', async() => {
    mockCall();
    const url = 'https://cors-anywhere.herokuapp.com/http://api.openrates.io/latest?base=GBP&symbols=EUR'
    const { getByText } = render(<Converter />);
    const rate = await waitForElement(() => getByText(/1.12/i))
    expect(axios.get).toHaveBeenCalledWith(url);
    expect(rate).toBeInTheDocument();
  });

  test('should accept input and show converted amount', async() => {
    const value = "23.00";
    const exchange = (parseFloat(value) * rate.toFixed(2)).toFixed(2)
    mockCall();
    const { getByTestId } = render(<Converter />);
    const sourceInput =  await waitForElement(() => getByTestId(/source/i))
    const targetInput =  await waitForElement(() => getByTestId(/target/i))
    fireEvent.change(sourceInput, { target: { value: value, name: 'source' } })
    expect(sourceInput.value).toEqual(value);
    expect(targetInput.value).toEqual(exchange)
  });

});
