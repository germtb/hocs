/* eslint-disable */
import React, { Component, PureComponent } from 'react';

const style = {
	display: 'flex',
	border: '1px solid gray',
	justifyContent: 'center',
	alignItems: 'center',
	padding: 10
};

export const FunctionalItem = ({ content }) => {
	return <div style={ style }>{ content } </div>;
};

export class PureItem extends PureComponent {
	componentWillMount() {
		// console.log('componentWillMount');
	}

	componentDidMount() {
		// console.log('componentDidMount');
	}

	render() {
		const { content } = this.props;
		return <div style={ style }>{ content } </div>;
	}
}

export class ImpureItem extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { content } = this.props;
		return <div style={ style }>{ content }</div>;
	}
}
