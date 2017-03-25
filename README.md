# Higher order components

Higher order components is a pattern that despite not existing in React's api, emerges naturally from its structure.

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

Here is an example:

```js
const CoolComponent = ({ title, description }) => {
	return <div>
		<div>{ title }</div>
		<div>{ description }</div>
	</div>;
};

const ListComponent = ({ items, ItemComponent }) => {
	return <div>
		{ items.map(item => <ItemComponent { ...item } /> }
	</div>;
};

const Main = (items) => {
	return <ListComponent items={ items } ItemComponent={ CoolComponent } />;
};
```

Well that worked great! My job is done here.

Oh wait... What if we want `CoolComponent` to access the context to get access some global variable we set there?
