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

const functionalHOC = parameter => BaseComponent => {
	const ExtendedComponent = props => <BaseComponent extraProp={ parameter } { ...props } />;
	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `functionalHOC(${baseComponentName})`;
	return ExtendedComponent;
}

const pureClassHOC = parameter => BaseComponent => {
	class ExtendedComponent extends PureComponent {
		constructor(props) {
			super(props);
		}

		render() {
			return <BaseComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `pureClassHOC(${baseComponentName})`;
	return ExtendedComponent;
}

const impureClassHOC = parameter => BaseComponent => {
	class ExtendedComponent extends Component {
		constructor(props) {
			super(props);
		}

		render() {
			return <BaseComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `impureClassHOC(${baseComponentName})`;
	return ExtendedComponent;
};

const functionalSquashingHOC = parameter => BaseComponent => {
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
	ExtendedComponent.displayName = `functionalSquashingHOC[${parameter}](${baseComponentName})`;
	return ExtendedComponent;
};

const pureClassSquashingHOC = parameter => BaseComponent => {
	class ExtendedComponent extends PureComponent {
		constructor(props) {
			super(props);
		}

		componentDidMount() {
			// console.log('Item component did mount', parameter);
		}

		componentWillMount() {
			// console.log('Item component will mount', parameter);
		}

		componentWillUnmount() {
			// console.log('Item component will unmount', parameter);
		}

		componentDidUpdate() {
			// console.log('Component did update', parameter);
		}

		render() {
			const props = {
				...this.props,
				[parameter]: parameter
			};

			if (typeof BaseComponent === 'function' &&
				// !BaseComponent.defaultProps &&
				// !BaseComponent.contextTypes &&
				!(BaseComponent && BaseComponent.prototype && BaseComponent.prototype.render)) {
				// !(BaseComponent && BaseComponent.prototype && typeof BaseComponent.prototype.isReactComponent === 'object')) {
				return BaseComponent(props);
			}
			const instance = new BaseComponent(props);
			const renderInstance = instance.render();
			return renderInstance;
		}
	}

	const baseComponentName = BaseComponent.displayName || BaseComponent.name;
	ExtendedComponent.displayName = `squashed[${parameter}](${baseComponentName})`;
	return ExtendedComponent;
}

const HOCS_PER_ITEM = 100;
const NUMBER_OF_ITEMS = 20;
const UPDATES = true;
const PERIOD = 1000;

const compose = (...args) => (firstArg) => args.reverse().reduce((acc, f) => f(acc), firstArg);

const FinalItem = compose(
	...range(HOCS_PER_ITEM).map(i => functionalSquashingHOC(`${i}`))
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
		// Perf.printWasted();
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
			}, PERIOD);
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
									range(NUMBER_OF_ITEMS).map(y => <FinalItem key={ this.cantorKey(x, y) } content={  y % 50 === 0 ? this.state.counter : 0 } />)
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
