import React, { Component, cloneElement } from 'react';
import ReactDOM from 'react-dom';
import { DIRECTIONS } from './utils';

class SwipeCards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            alertLeft: false,
            alertRight: false,
            alertTop: false,
            alertBottom: false,
            containerSize: { x: 0, y: 0 }
        };
        this.removeCard = this.removeCard.bind(this);
        this.setSize = this.setSize.bind(this);
        this.setIndex = this.setIndex.bind(this);
        this.setIndex(this.state.index);
        if(this.props.getUndo) {
            this.props.getUndo(this.undo.bind(this));
        }
    }

    setIndex(index) {
        if(this.props.setIndex) {
            this.props.setIndex(index);
        }
    }

    removeCard(side, cardId) {
        const { children, onEnd } = this.props;
        setTimeout(() => this.setState({ [`alert${side}`]: false }), 500);

        if (children.length === this.state.index + 1 && onEnd) onEnd();

        const index = this.state.index + 1;
        this.setState({
            index,
            [`alert${side}`]: true
        });
        this.setIndex(index);
    }

    undo() {
        if(this.state.index > 0) {
            const index = this.state.index - 1;
            this.setState({ index });
            this.setIndex(index);
        }
    }

    componentDidMount() {
        this.setSize();
        window.addEventListener('resize', this.setSize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.setSize);
    }

    setSize() {
        const container = ReactDOM.findDOMNode(this);
        const containerSize = {
            x: container.offsetWidth,
            y: container.offsetHeight
        };
        this.setState({ containerSize });
    }

    render() {
        const { index, containerSize } = this.state;
        const { children, className, onSwipeTop, onSwipeBottom } = this.props;
        if (!containerSize.x || !containerSize.y)
            return <div className={className} />;

        const _cards = children.reduce((memo, c, i) => {
            if (index > i) return memo;
            const props = {
                key: i,
                containerSize,
                index: children.length - index,
                ...DIRECTIONS.reduce(
                    (m, d) => ({
                        ...m,
                        [`onOutScreen${d}`]: () => this.removeCard(d)
                    }),
                    {}
                ),
                active: index === i
            };
            return [cloneElement(c, props), ...memo];
        }, []);

        return (
            <div className={className}>
                {DIRECTIONS.map(d => (
                    <div
                        key={d}
                        className={`${
                            this.state[`alert${d}`] ? 'alert-visible' : ''
                        } alert-${d.toLowerCase()} alert`}
                    >
                        {this.props[`alert${d}`]}
                    </div>
                ))}
                <div id="cards">{_cards}</div>
            </div>
        );
    }
}

export default SwipeCards;
