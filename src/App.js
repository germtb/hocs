import React, { Component, PureComponent } from 'react';
import logo from './logo.svg';
import './App.css';

function range(n) {
	const result = [];
	for (let i = 0; i < n; i++) {
		result.push(i);
	}

	return result;
}

const PureItem = ({ content }) => {
	return <div style={{ display: 'flex', padding: 10, margin: 10, border: '1px solid gray' }}>{ content }</div>;
};

class PureClassItem extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		const { content } = this.props;
		return <div style={{ display: 'flex', padding: 10, margin: 10, border: '1px solid gray' }}>{ content }</div>;
	}
}

class ImpureClassItem extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { content } = this.props;
		return <div style={{ display: 'flex', padding: 10, margin: 10, border: '1px solid gray' }}>{ content }</div>;
	}
}

const statelessHigherOrderComponent = parameter => BaseComponent => {
	return props => <BaseComponent extraProp={ parameter } { ...props } />;
}

const statefulPureHigherOrderComponent = parameter => BaseComponent => {
	class ExtendedComponent extends PureComponent {
		constructor(props) {
			super(props);
		}

		render() {
			return <BaseComponent extraProp={ parameter } { ...this.props } />;
		}
	}
}

const statefulImpureHigherOrderComponent = parameter => BaseComponent => {
	class ExtendedComponent extends Component {
		constructor(props) {
			super(props);
		}

		render() {
			return <BaseComponent extraProp={ parameter } { ...this.props } />;
		}
	}
};

const FinalItem = range(4).reduce((acc, i) => statelessHigherOrderComponent('something')(acc), PureItem);

class App extends Component {

	constructor(props) {
		super(props);
		this.state = { counter: 0 };
	}

	componentDidMount() {
		// setInterval(() => {
		// 	this.setState({ counter: this.state.counter + 1 });
		// }, 1000);
	}

	render() {
		return (
			<div className="App">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React</h2>
				</div>
				<div className="App-intro" style={{ display: 'flex', flexDirection: 'column', padding: 10, overflow: 'scroll' }}>
					{
						range(5000).map(x => <FinalItem key={ x } content={ this.state.counter } />)
					}
				</div>
			</div>
		);
	}
}

export default App;
