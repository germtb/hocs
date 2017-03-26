# Higher order components: the revenge of the functions
This text aims to provide a broad explanation of what higher order components are, what are their limitations, their dangerous, how to implement them, how to use them and what are the limits of this technique.

## What is a higher order component?
Higher order components is a pattern that does not exist in React's api, but it emerges naturally from its structure.

But what is a higher order component?

The simplest way to put it is that it is a function that takes a component and returns another component. The simplest type signature it can have is:

```js
Component => Component;
```

The name is derived from the concept of higher order function, which is a function returns another function as result (:poop: not technically accurate). And that is exactly what this pattern is because in React there is really very little differences between a component and a function.

Take for example a list item component:
```js
const ListItem = ({ key, content }) => <div key={key} >{ content }</div>;
```

How is it different than a function? Ah, yeah, there is something:
```js
const listItem = ({ key, content }) => <div key={key} >{ content }</div>;
```

---
JSX problems
---

What should React render in this case?
```js
function Main() {
	const p = () => <div />;
	return <p />;
}
```

For that reason react components are always capitalised (even if it means using a dumb variable just for renaming);

---

Since we know how to use higher order functions to compose functions, and we know how useful it is (think `map`, `reduce`, currying...) why not trying it on components?

So, in reality any function with the typing `Component => Component` is a higher order component, let's see an example:

```js
const onClick = x => x; // Do fun stuff
const myFirstHOC = Component => props => {
	return <button onClick={ onClick } >
		<Component {...props } />
	<button>;
};

// Example use
const CoolComponent = ({ title, description }) => {
	return <div>
		<div>{ title }</div>
		<div>{ description }</div>
	</div>;
};

const EnhancedCoolComponent = myFirstHOC(CoolComponent);

// Use it like
<EnhancedCoolComponent title='HELLO' description='This is obviously a description'/>
```
That's cool! But that hoc is not really that reusable, after all it will only work if you want a component to call that specific on click handler. Can we improve this? YES, WE PARAMETRISE.

```js
const mySecondHOC = onClick => Component => props => {
	return <button onClick={ onClick } >
		<Component {...props } />
	<button>;
};
```
This can have different names, all of them very fancy: parametrised hoc, higher order hoc, hoc factory... But you'll see this pattern is so prevalent that it is often just referred as hoc.

Now, how is this useful? Because it allows us to put most of the logic of an application in hocs that can be shared and **composed**.

## How to implement hocs

This is a big topic because there are many ways to implement hocs wrong. I am aware of three ways of implementing hocs, one of which is plain dangerous.

### Directly modify the input component

The hoc takes a component and then modifies it. This is not a good idea: several hocs could override each other, and can you imagine the problem when using libraries that implement hocs that mutate the input component? This is an example:

```js
const onRender = InputComponent => {
	InputComponent.prototype.render = () => {
		console.log('Render happening now!');
		return InputComponent.prototype.render();
	};

	return InputComponent;
};
```

## Inheritance

Inherit the input component to extend its behaviour

```js
const withHover = ({ normalColor, hoverColor }) => InputComponent => class ExtendedComponent extends InputComponent {
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
			{ super.render() }
		</div>;
	}
};

const ComponentWithHover = withHover({ normalColor: 'white', hoverColor: 'blue' })(Component);
```

This behaviour starts to show the power of hocs. Hover, like many other behaviours, are shared among components, so the ability to extract those behaviours and later compose them together is immensely powerful. In the end we will remain with very simple just-view components, while the hocs will hold most of the smartness of the UI. Also, this is the way radium has been implemented!

## Proxy props

This is my personal favourite implementation of hocs, since I think it is the more versatile and the one you are more likely to use in any case.

```js
const withSomethingFromContext = InputComponent => {
	class ExtendedComponent extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.somethingFromContext = this.context.somethingFromContext;
		}

		render() {
			return <InputComponent { ...this.props } somethingFromContext={ somethingFromContext } />;
		};
	}

	ExtendedComponent.contextTypes = { somethingFromContext: React.PropTypes.object };
	return ExtendedComponent;
}
```

This implementation is based on creating a new React component that returns renders the input component in the render method (:poop: this creates a little issue that I will explain later). This pattern allows us to:
- Add extra props
- Modify props
- Handle state
- Add life cycles (also available with an inheritanc hoc)

```js
const connect = mapStateToProps => InputComponent => {
	class ExtendedComponent extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.store = this.context.store;
			this.state = mapStateToProps(this.store.getState());
			this.store.subscribe(state => setState(mapStateToProps(state)));
		}

		render() {
			return <InputComponent { ...this.props } { ...this.state } />;
		};
	}

	ExtendedComponent.contextTypes = { store: React.PropTypes.object };
	return ExtendedComponent;
};
```

And that is more or less react-redux. Now let's see an example of how to get rid of state.

```js
const withState = initialState => InputComponent => class ExtendedComponent extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = initialState;
	}

	render() {
		return <InputComponent { ...this.props } setState={ this.setState.bind(this) } { ...this.state } />;
	}
};

const AmazingPonyView = withState({ pony: 'Cinnamon' })(DullPonyView)

const DullPonyView = ({ setState, pony }) => <div onClick={ setState({ pony: `Don't touch ${pony}!`})}>{ pony }</div>;

```

This hoc is really cool because it means that you no longer need make a functional component into a class just because you need local state. This hoc abstracts that from you and you can then just consume it as props. As I said before, we see how more and more from our app can be moved into hocs.

## Other possibilities?

In the end, any function with the signature `Component => Component` is a hoc, so any other implementation, as long as it doesn't mutate its arguments, could be a good idea and allow other transformations.

## Danger points

Since the classes created by a hoc are dynamically created, `hoc(Somethign)` will have different identities for each call. For that reason it is better to enhance the components outside the render cycle. One pattern for this is to export the plain component from its file, and then export the enhanced version as default. This is very useful for the next topic: testing.

## Testing

How do we handle test with hocs? The truth is that hocs make testing much easier. You can test each of your hocs in isolation, with mocked input components. Then you should test the plain component also in isolation, mocking the props that would normally be passed by the hocs. This gives us total control over the test. See this example.

```js
import { DullPonyView } from './cool-path';

describe('DullPonyView', () => {
	it('should render a pony', () => {
		const pony = 'Sparkles';
		const output = enzyme.render(<DullPonyView pony={ pony } />);
		expect(output).find('div').to.have.text(pony);
	});
});

```

Since we separated the view from the state handling, we can test them unit test them very independently, not to mention that we get to test the state part only once, not on every component that uses state.

## Performance and squashing

The last  bit I wanted to talk about is performance and squashing. When using the props proxy implementation of a hoc we are creating new React instances for each hoc we apply. Does this have any cost on us? I performed a little experiment and created a mock website with around a N elements, each one wrapped by M hocs. 10% of the elements rerender every second.

The result is that if the hoc inherits `PureComponent` rather than `Component` we get much better results. This is because react is smart and it will not render them when the props that are passed are the same.


## Questions?
