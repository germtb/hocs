import React, { Component, PureComponent } from 'react';
import logo from './logo.svg';
import './App.css';
import Perf from 'react-addons-perf';
import { FunctionalItem, PureClassItem, ImpureClassItem } from './Item';

function range(n) {
	const result = [];
	for (let i = 0; i < n; i++) {
		result.push(i);
	}

	return result;
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

const functionalSquashingHigherOrderComponent = parameter => BaseComponent => {
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
	ExtendedComponent.displayName = `functionalSquashingHigherOrderComponent[${parameter}](${baseComponentName})`;
	return ExtendedComponent;
};

const classPureSquashingHigherOrderComponent = parameter => BaseComponent => {
	class ExtendedComponent extends PureComponent {
		constructor(props) {
			super(props);
		}

		componentDidMount() {
			console.log('Item component did mount', parameter);
		}

		componentWillMount() {
			console.log('Item component will mount', parameter);
		}

		componentWillUnmount() {
			console.log('Item component will unmount', parameter);
		}

		componentDidUpdate() {
			console.log('Component did update', parameter);
		}

		render() {
			if (typeof BaseComponent === 'function' &&
				!BaseComponent.defaultProps &&
				!BaseComponent.contextTypes &&
				!(BaseComponent && BaseComponent.prototype && typeof BaseComponent.prototype.isReactComponent === 'object')) {
				return BaseComponent(this.props);
			}
			const instance = new BaseComponent(this.props);
			console.log('instance: ', instance);
			return instance.render(this.props);
		}
	}

	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `classImpureHigherOrderComponent(${baseComponentName})`;
	return ExtendedComponent;
}

const HOCS_PER_ITEM = 5;
const NUMBER_OF_ITEMS = 1;
const UPDATES = false;

const compose = (...args) => (firstArg) => args.reverse().reduce((acc, f) => f(acc), firstArg);

const FinalItem = compose(
	...range(HOCS_PER_ITEM).map(i => classPureSquashingHigherOrderComponent(`${i}`))
)(FunctionalItem);

class App extends Component {

	constructor(props) {
		super(props);
		this.state = { counter: 0 };
	}

	componentDidUpdate() {
		console.log('App componentDidUpdate');
		Perf.stop();
		Perf.printInclusive();
		Perf.printWasted();
		Perf.start();
	}

	componentWillMount() {
		console.log('App componentWillMount');
	}

	componentDidMount() {
		console.log('App componentDidMount');
		if (UPDATES) {
			setInterval(() => {
				this.setState({ counter: this.state.counter + 1 });
			}, 1000);
		}
	}

	cantorKey(x, y) {
		return 0.5 * (x + y) * (x + y + 1) + y;
	}

	render() {
		return (
			<div className="App">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React</h2>
				</div>
				<div className="App-intro" style={{ display: 'flex', overflow: 'scroll', flexDirection: 'column' }}>
					{
						range(NUMBER_OF_ITEMS).map(x => {
							return <div key={ x } style={{ display: 'flex', overflow: 'scroll', flexDirection: 'row' }}>
								{
									range(NUMBER_OF_ITEMS).map(y => <FinalItem key={ this.cantorKey(x, y) } content={  x % 50 === 0 ? this.state.counter : 0 } />)
								}
							</div>;
						})
					}
				</div>
			</div>
		);
	}
}

export default App;
