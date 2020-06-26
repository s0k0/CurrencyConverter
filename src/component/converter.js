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
            invert: null,
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
        this.interval = setInterval(() =>  this.getRate(), 10000);
    };
    componentWillUnmount() {
        clearInterval(this.interval);
    };
    getRate = () => {
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
                const invert = 1 / rate 
                this.setState({ rate: rate.toFixed(2) });
                this.setState({ invert: invert.toFixed(2) });
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
    clearInputs = () => {
        this.setState({ change: 0 })
        this.setState({ amount: 0 })
    };  
    updatePocket = (source,target) => {
        if(this.state.amount > source.amount) return
        const pockets = this.state.pockets
        pockets.forEach( _ => {
            if(_.currency === target.currency) _.amount = (_.amount + parseFloat(this.state.change)).toFixed(2)
            if(_.currency === source.currency) _.amount = (_.amount - parseFloat(this.state.amount)).toFixed(2)
        }) 
        this.setState({ pockets: pockets })
        this.clearInputs()
    };
    render() {
        const source = this.state.pockets.find(_ => _.currency === this.state.sourceCurrency);
        const target = this.state.pockets.find(_ => _.currency === this.state.targetCurrency);
        return (
            <div className="converter">
                <h1>
                    Convert Currencies
                </h1>
                <div className="controls">
                    <button onClick={_ => this.clearInputs()} >Cancel</button>    
                    <span>
                     {source.symbol} 1 = {target.symbol} {this.state.rate} 
                    </span>
                    <button onClick={_ =>this.updatePocket(source,target)}>Exchange</button>  
                </div>
                <div className="source">
                    <div className="pocket">
                        <label className="currency">
                            {source.currency}
                        </label>
                        <span className="amount">
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
                {this.state.amount > source.amount ? <h5>There is not enough credit available for this transaction.</h5>  : ''} 
                <div className="target">
                    <div className="pocket">
                        <label className="currency">
                            {target.currency}
                        </label>
                        <span className="amount">
                            You have {target.symbol} {target.amount}
                        </span>
                    </div>
                    <div className="exchange">
                        <input
                            name="amount"
                            type="number"
                            readOnly
                            value={this.state.change}
                        />
                        <span className="note">
                            {target.symbol} 1 = {source.symbol} {this.state.invert} 
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
export default Converter;