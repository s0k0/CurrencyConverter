import React from "react";
import axios from "axios";
import './converter.css';

class Converter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            change: 0,
            sourceCurrency: "GBP",
            targetCurrency: "EUR",
            amount: 0,
            rate: null,
            currencies: ["EUR", "GBP", "USD"],
            pockets: [
                {
                    currency: "EUR",
                    symbol: "€",
                    amount: 0
                },
                {
                    currency: "GBP",
                    symbol: "£",
                    amount: 1000
                },
                {
                    currency: "USD",
                    symbol: "$",
                    amount: 0
                }
            ]
        };
    }
    componentDidMount() {
        this.getRate()
    };
    getRate = () => {
        //TODO: call this in fixed interval and store data in state
        //TODO: add/subtract amounts from pockets
        //TODO: change pockets ?
        //TODO: add tests
        //TODO: limit input to two decial points
        //TODO: make target input changable too
        axios
            .get(
                //cors enabled: https://cors-anywhere.herokuapp.com/
                `https://cors-anywhere.herokuapp.com/http://api.openrates.io/latest?base=${
                this.state.sourceCurrency
                }&symbols=${this.state.targetCurrency}`
            )
            .then(response => {
                const rate = response.data.rates[this.state.targetCurrency];
                this.setState({ rate: rate.toFixed(2) });
            })
            .catch(error => {
                console.log("Error Occured when Fetching Rates", error.message);
            });
    };
    convertCurrency = event => {
        this.setState({ amount: event.target.value });
        const change = event.target.value * this.state.rate;
        this.setState({ change: change.toFixed(2) });
    };
    render() {
        const source = this.state.pockets.find(_ => _.currency === this.state.sourceCurrency);
        const target = this.state.pockets.find(_ => _.currency === this.state.targetCurrency);
        return (
            <div className="converter">
                <h1>
                    Convert Currencies
                </h1>
                <span>
                    1 {source.symbol} = {this.state.rate} {target.symbol}
                </span>
                <div className="source">
                    <div className="pocket">
                        <label>
                            {source.currency}
                        </label>
                        <span>
                            You have {source.symbol} {source.amount}
                        </span>
                    </div>
                    <input
                        name="amount"
                        type="number"
                        required
                        pattern="^\d*(\.\d{0,2})?$" 
                        value={this.state.amount}
                        onChange={event => this.convertCurrency(event)}
                    />
                </div>
                <div className="target">
                    <div className="pocket">
                        <label>
                            {target.currency}
                        </label>
                        <span>
                            You have {target.symbol} {target.amount}
                        </span>
                    </div>
                    <input
                        name="amount"
                        type="number"
                        readOnly
                        value={this.state.change}
                    />
                </div>
            </div>
        );
    }
}
export default Converter;