import React from "react";
import axios from "axios";
import './converter.css';

class Converter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceCurrency: "GBP",
            targetCurrency: "EUR",
            amount: "",
            change: "",
            rate: null,
            invertRate: null,
            currencies: ["EUR", "GBP", "USD"],
            pockets: [
                {
                    currency: "EUR",
                    symbol: "€",
                    balance: 200
                },
                {
                    currency: "GBP",
                    symbol: "£",
                    balance: 1000
                },
                {
                    currency: "USD",
                    symbol: "$",
                    balance: 10
                }
            ]
        };
    }
    componentDidMount() {
        this.getRate()
        this.interval = setInterval(() => this.getRate(), 10000);
    };
    componentWillUnmount() {
        clearInterval(this.interval);
    };
    getRate = () => {
        axios
            .get(
                //cors enabled: https://cors-anywhere.herokuapp.com/
                `https://cors-anywhere.herokuapp.com/http://api.openrates.io/latest?base=${
                this.state.sourceCurrency
                }&symbols=${this.state.targetCurrency}`
            )
            .then(response => {
                const rate = response.data.rates[this.state.targetCurrency];
                const invertRate = 1 / rate
                this.setState({ rate: rate.toFixed(2) });
                this.setState({ invertRate: invertRate.toFixed(2) });
            })
            .catch(error => {
                console.log("Error Occured when Fetching Rates", error.message);
            });
    };
    convertCurrency = event => {
        const value = event.target.value
        if (event.target.name === "source") {
            const change = value * this.state.rate;
            this.setState({ amount: value });
            this.setState({ change: change === 0 ? '' : change.toFixed(2) });
        } else {
            const amount = value * this.state.invertRate;
            this.setState({ amount: amount === 0 ? '' : amount.toFixed(2) });
            this.setState({ change: value });
        }
    };
    clearInputs = () => {
        this.setState({ change: '' })
        this.setState({ amount: '' })
    };
    updatePocket = (source, target) => {
        if (this.state.amount > source.amount || this.state.amount === '') return
        const newPockets = this.state.pockets
        newPockets.forEach(_ => {
            if (_.currency === target.currency) _.balance = (parseFloat(_.balance) + parseFloat(this.state.change)).toFixed(2)
            if (_.currency === source.currency) _.balance = (parseFloat(_.balance) - parseFloat(this.state.amount)).toFixed(2)
        })
        this.setState({ pockets: newPockets })
        this.clearInputs()
    };
    changePocket = event => {
        if (event.target.name === "source") this.setState({ sourceCurrency: event.target.value })
        if (event.target.name === "target") this.setState({ targetCurrency: event.target.value })
        this.getRate()
    };
    twoDecimalPoints = event => {
        event.target.value = event.target.value.replace(/([^\d]*)(\d*(.\d{0,2})?)(.*)/, '$2');
    };
    renderBalance(pocket) {
        return (
            <div className="pocket">
                <label className="currency">
                    {pocket.currency}
                </label>
                <span className="balance">
                    You have {pocket.symbol} {pocket.balance}
                </span>
            </div>
        );
    };
    renderInput(sign, sourceSymbol = "£", targetSymbol = "€") {
        const name = sign === '-' ? "source" : "target"
        const value = sign === '-' ? this.state.amount : this.state.change
        return (
            <div className={sign === '+' ? 'pocket' : null}>
                <div className="exchange">
                    <span className="sign">{sign}</span>
                    <input
                        name={name}
                        data-testid={name}
                        type="text"
                        placeholder=""
                        autoFocus={sign === '-'}
                        value={value}
                        onInput={event => this.twoDecimalPoints(event)}
                        onChange={event => this.convertCurrency(event)}
                    />
                </div>
                {this.state.rate && sign === '+'
                    ? <span className="invertRate">{targetSymbol} 1 = {sourceSymbol} {this.state.invertRate}</span>
                    : null}
            </div>
        );
    };
    renderPocketSelection(pocketName, currency) {
        return (
            <select name={pocketName} onChange={event => this.changePocket(event)} defaultValue={currency}>
                {this.state.pockets.map(_ =>
                    <option value={_.currency} key={_.currency}>{_.currency}</option>
                )}
            </select>
        );
    };
    renderPockets(source,target) {
        return (
            <React.Fragment>
                <div className="source">
                    {this.renderBalance(source)}
                    {this.renderInput('-')}
                </div>
                {source.balance >= this.state.amount
                    ? null
                    : <span className="error">Not enough credit available.</span>}
                <div className="target">
                    {this.renderBalance(target)}
                    {this.renderInput("+", source.symbol, target.symbol)}
                </div>
            </React.Fragment>
        );
    };
    renderSwitchPockets(source,target) {
        return (
            <React.Fragment>
               <h5>Change your pockets for transfering money:</h5>
                <div className="changePockets">
                    {this.renderPocketSelection('source', source.currency)}
                    <p><i className="arrow right"></i></p>
                    {this.renderPocketSelection('target', target.currency)}
                </div>
                {source.currency !== target.currency
                    ? null :
                    <span className="error">Must be different currencies selected.</span>}
            </React.Fragment>
        );
    };
    
    render() {
        const source = this.state.pockets.find(_ => _.currency === this.state.sourceCurrency);
        const target = this.state.pockets.find(_ => _.currency === this.state.targetCurrency);
        const isBalanceSufficient = source.balance >= this.state.amount
        const isDifferentPockets = source.currency !== target.currency
        return (
            <div className="converter">
                <h1>
                    Exchange Credit
                </h1>
                <div className="controls">
                    <button onClick={_ => this.clearInputs()} >Cancel</button>
                    {this.state.rate
                        ? <span> {source.symbol} 1 = {target.symbol} {this.state.rate}</span>
                        : null}
                    <button className={!isBalanceSufficient || !isDifferentPockets ? 'disabled' : null} 
                            disabled={!isBalanceSufficient} 
                            onClick={_ => this.updatePocket(source, target)} >
                                Exchange
                    </button>
                </div>
                    {this.renderPockets(source,target)}
                    {this.renderSwitchPockets(source,target)} 
            </div>
        );
    }
}
export default Converter;