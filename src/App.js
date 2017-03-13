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

const FunctionalItem = ({ content }) => {
	return <div style={{ display: 'flex', border: '1px solid gray', justifyContent: 'center', alignItems: 'center' }}>{ content }</div>;
};

class PureClassItem extends PureComponent {
	constructor(props) {
		super(props);
		this.state = { something: 'foo' };
	}

	componentDidMount() {
		console.log('Item component did mount');
	}

	componentWillMount() {
		console.log('Item component will mount');
		this.setState({ something: 'bar' });
	}

	render() {
		const { content } = this.props;
		return <div style={{ display: 'flex', border: '1px solid gray' }}>{ content }{ this.state.something }</div>;
	}
}

class ImpureClassItem extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		console.log('Item component did mount');
	}

	componentWillMount() {
		console.log('Item component will mount');
	}

	render() {
		const { content } = this.props;
		return <div style={{ display: 'flex', border: '1px solid gray' }}>{ content }</div>;
	}
}

const functionalHigherOrderComponent = parameter => BaseComponent => {
	const ExtendedComponent = props => <BaseComponent extraProp={ parameter } { ...props } />;
	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `functionalHigherOrderComponent(${baseComponentName})`;
	return ExtendedComponent;
}

const classPureHigherOrderComponent = parameter => BaseComponent => {
	class ExtendedComponent extends PureComponent {
		constructor(props) {
			super(props);
		}

		render() {
			return <BaseComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `classPureHigherOrderComponent(${baseComponentName})`;
	return ExtendedComponent;
}

const classImpureHigherOrderComponent = parameter => BaseComponent => {
	class ExtendedComponent extends Component {
		constructor(props) {
			super(props);
		}

		render() {
			return <BaseComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `classImpureHigherOrderComponent(${baseComponentName})`;
	return ExtendedComponent;
};

const squashingHigherOrderComponent = parameter => BaseComponent => {
	const ExtendedComponent = props => {
		if (typeof BaseComponent === 'function' &&
			!BaseComponent.defaultProps &&
			!BaseComponent.contextTypes &&
			!(BaseComponent && BaseComponent.prototype && typeof BaseComponent.prototype.isReactComponent === 'object')) {
			return BaseComponent(props);
		}
		return new BaseComponent(props);
	};
	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `squashingHigherOrderComponent(${baseComponentName})`;
	return ExtendedComponent;
};

const HOCS_PER_ITEM = 1;
const NUMBER_OF_ITEMS = 1;

// const FinalItem = range(HOCS_PER_ITEM).reduce((acc, i) => functionalHigherOrderComponent('something')(acc), PureClassItem);
const FinalItem = range(HOCS_PER_ITEM).reduce((acc, i) => squashingHigherOrderComponent('something')(acc), PureClassItem);

class App extends Component {

	constructor(props) {
		super(props);
		this.state = { counter: 0 };
	}

	componentDidUpdate() {
		console.log('App componentDidUpdate');
		// Perf.stop();
		// Perf.printInclusive();
		// Perf.printWasted();
		// Perf.start();
	}

	componentWillMount() {
		console.log('App componentWillMount');
	}

	componentDidMount() {
		console.log('App componentDidMount');
		// Perf.start();
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
