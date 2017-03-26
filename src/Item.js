import React, { Component, PureComponent } from 'react';

const style = {
	display: 'flex',
	border: '1px solid gray',
	justifyContent: 'center',
	alignItems: 'center',
	padding: 10
};

export const FunctionalItem = ({ content, ...others }) => {
	return <div style={ style }>{ content } </div>;
	// return <div style={ style }>{ content }{ JSON.stringify(others) }</div>;
};

export class PureClassItem extends PureComponent {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// console.log('Item component did mount');
	}

	componentWillMount() {
		// console.log('Item component will mount');
	}

	componentWillUnmount() {
		// console.log('Item component will unmount');
	}

	componentDidUpdate() {
		// console.log('Component did update');
	}

	render() {
		const { content } = this.props;
		return <div style={ style }>{ content } </div>;
	}
}

export class ImpureClassItem extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// console.log('Item component did mount');
	}

	componentWillMount() {
		// console.log('Item component will mount');
	}

	componentWillUnmount() {
		// console.log('Item component will unmount');
	}

	componentDidUpdate() {
		// console.log('Component did update');
	}

	render() {
		const { content } = this.props;
		return <div style={ style }>{ content }</div>;
	}
}
