import React, { Component, PureComponent } from 'react';
import logo from './logo.svg';
import './App.css';
import Perf from 'react-addons-perf';

function range(n) {
	const result = [];
	for (let i = 0; i < n; i++) {
		result.push(i);
	}

	return result;
}

const PureItem = ({ content }) => {
	return <div style={{ display: 'flex', border: '1px solid gray', justifyContent: 'center', alignItems: 'center' }}>{ content }</div>;
};

class PureClassItem extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		const { content } = this.props;
		return <div style={{ display: 'flex', border: '1px solid gray' }}>{ content }</div>;
	}
}

class ImpureClassItem extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { content } = this.props;
		return <div style={{ display: 'flex', border: '1px solid gray' }}>{ content }</div>;
	}
}

const statelessHigherOrderComponent = parameter => BaseComponent => {
	const ExtendedComponent = props => <BaseComponent extraProp={ parameter } { ...props } />;
	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `StatelessHigherOrderComponent(${baseComponentName})`;
	return ExtendedComponent;
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

	return ExtendedComponent;
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

	return ExtendedComponent;
};

const squashingHigherOrderComponent = parameter => BaseComponent => {
	return props => BaseComponent(props);
};

const HOCS_PER_ITEM = 10;
const NUMBER_OF_ITEMS = 1000;
const FinalItem = range(HOCS_PER_ITEM).reduce((acc, i) => squashingHigherOrderComponent('something')(acc), PureItem);

class App extends Component {

	constructor(props) {
		super(props);
		this.state = { counter: 0 };
	}

	componentDidUpdate() {
		Perf.stop();
		Perf.printInclusive();
		Perf.printWasted();
		Perf.start();
	}

	componentDidMount() {
		Perf.start();
		setInterval(() => {
			this.setState({ counter: this.state.counter + 1 });
		}, 1000);
	}

	render() {
		return (
			<div className="App">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React</h2>
				</div>
				<div className="App-intro" style={{ display: 'block', overflow: 'scroll', columnCount: NUMBER_OF_ITEMS / 10, columnWidth: 50 }}>
					{
						range(NUMBER_OF_ITEMS).map(x => <FinalItem key={ x } content={  x % 50 === 0 ? this.state.counter : 0 } />)
					}
				</div>
			</div>
		);
	}
}

export default App;
