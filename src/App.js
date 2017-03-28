/* eslint-disable */
import React, { Component, PureComponent } from 'react';
import logo from './logo.svg';
import './App.css';
import Perf from 'react-addons-perf';
import { FunctionalItem, PureItem, ImpureItem } from './Item';

function range(n) {
	const result = [];
	for (let i = 0; i < n; i++) {
		result.push(i);
	}

	return result;
}

const isFunctionalComponent = (component) => typeof component === 'function' &&
	// !component.defaultProps &&
	// !component.contextTypes &&
	!(component && component.prototype && typeof component.prototype.isReactComponent === 'object');

const functionalHOC = parameter => InputComponent => {
	const ExtendedComponent = props => <InputComponent extraProp={ parameter } { ...props } />;

	// const InputComponentName = InputComponent.displayName || InputComponent.name;
	// ExtendedComponent.displayName = `functionalHOC(${InputComponentName})`;
	return ExtendedComponent;
}

const pureHOC = parameter => InputComponent => {
	class ExtendedComponent extends PureComponent {
		constructor(props) {
			super(props);
		}

		render() {
			return <InputComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	// const InputComponentName = InputComponent.displayName || InputComponent.name;
	// ExtendedComponent.displayName = `pureHOC(${InputComponentName})`;
	return ExtendedComponent;
}

const impureHOC = parameter => InputComponent => {
	class ExtendedComponent extends Component {
		constructor(props) {
			super(props);
		}

		render() {

			return <InputComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	// const InputComponentName = InputComponent.displayName || InputComponent.name;
	// ExtendedComponent.displayName = `impureHOC(${InputComponentName})`;
	return ExtendedComponent;
};

const withState = initialState => InputComponent => {
	class ExtendedComponent extends React.PureComponent {
		constructor(props) {
			super(props);
			this.state = initialState;
		}

		render() {
			return <InputComponent { ...this.props } setState={ this.setState.bind(this) } { ...this.state } />;
		}
	};

	// const InputComponentName = InputComponent.displayName || InputComponent.name;
	// ExtendedComponent.displayName = `withState[${JSON.stringify(initialState)}](${InputComponentName})`;
	return ExtendedComponent;
}

const inheritanceHOC = ({ normalColor, hoverColor }) => InputComponent => {
	const isClass = !isFunctionalComponent(InputComponent);
	const ParentComponent = isClass ? InputComponent : React.PureComponent;

	class ExtendedComponent extends ParentComponent {
		constructor(props) {
			super(props);
			this.state = {
				backgroundColor: normalColor
			}
		}

		onMouseEnter() {
			this.setState({ backgroundColor: hoverColor });
		}

		onMouseLeave() {
			this.setState({ backgroundColor: normalColor });
		}

		render() {
			return <div style={ this.state } onMouseEnter={ this.onMouseEnter.bind(this) } onMouseLeave={ this.onMouseLeave.bind(this) }>
				{ isClass ? super.render() : InputComponent(this.props)  }
			</div>;
		}
	}

	// const InputComponentName = InputComponent.displayName || InputComponent.name;
	// ExtendedComponent.displayName = `inheritanceHOC(${InputComponentName})`;
	return ExtendedComponent;
}

const squashingImpureHOC = parameter => InputComponent => {
	class ExtendedComponent extends Component {
		constructor(props) {
			super(props);
		}

		render() {
			if (isFunctionalComponent((InputComponent))) {
				return InputComponent(props);
			}
			return <InputComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	// const InputComponentName = InputComponent.displayName || InputComponent.name;
	// ExtendedComponent.displayName = `impureHOC(${InputComponentName})`;
	return ExtendedComponent;
};

const squashingPureHOC = parameter => InputComponent => {
	class ExtendedComponent extends PureComponent {
		constructor(props) {
			super(props);
		}

		render() {
			const props = {
				...this.props,
				[parameter]: parameter
			};

			if (isFunctionalComponent(InputComponent)) {
				return InputComponent(props);
			}

			return <InputComponent extraProp={ parameter } { ...this.props } />;
		}
	}

	// const InputComponentName = InputComponent.displayName || InputComponent.name;
	// ExtendedComponent.displayName = `squashed[${parameter}](${InputComponentName})`;
	return ExtendedComponent;
}

const HOCS_PER_ITEM = 40;
const NUMBER_OF_ITEMS = 22;
const UPDATES = true;
const PERIOD = 1000;

let limit = 0;

const compose = (...args) => (firstArg) => args.reverse().reduce((acc, f) => f(acc), firstArg);

const FinalItem = compose(
	// withState({ amazingState: 0 }),
	// inheritanceHOC({ normalColor: 'white', hoverColor: 'blue' }),
	// functionalSquashingHOC('hello')
	...range(HOCS_PER_ITEM).map(i => squashingImpureHOC(`${i}`))
)(ImpureItem);

class App extends Component {

	constructor(props) {
		super(props);
		this.state = { counter: 0 };
	}

	componentDidUpdate() {
		Perf.stop();
    Perf.printInclusive();
    Perf.printWasted();
		console.log('--------');
	}

	componentDidMount() {
		if (UPDATES) {
			setInterval(() => {
				limit += 1;
				if (limit <= 20) {
					Perf.start();
					this.setState({ counter: this.state.counter + 1 });
				}
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
