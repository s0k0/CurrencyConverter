
import React from 'react';
import axios from 'axios';
import { render, waitForElement } from '@testing-library/react';
import Converter from './converter';

jest.mock('axios')

function mockCall() {
  axios.get.mockResolvedValueOnce({
    data: {
       base: 'GBP',
       rates: { EUR: 1.1234}
    }
  });
} 

describe('Converter component', () => {

  test('renders converter component', () => {
    expect(Converter).toMatchSnapshot()
  });

  test('should fetch rates', async() => {
    mockCall();
    const url = 'https://cors-anywhere.herokuapp.com/http://api.openrates.io/latest?base=GBP&symbols=EUR'
    const { getByText } = render(<Converter />);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(url);
    //check whether exchange rate from mock response is received and rendered into component
    const rate = await waitForElement(() => getByText(/1.12/i))
    expect(rate).toBeInTheDocument();
  });
});
