import * as classNames from 'classnames';
import React from 'react';
import { animated, interpolate } from 'react-spring';
import AnimatedItems from './animatedItems';
import './animatedBoard.css';

const SUITS = {
    'CLUB': '♣',
    'DIAMOND': '♢',
    'HEART': '♡',
    'SPADE': '♠',
};

export default class AnimatedBoard extends React.Component {

    render() {
        const { width, height, scaledWidth, scaledHeight, characterCards, healthPoints, normalCards } = this.props;
        return <div>
            <AnimatedItems
                items={characterCards}
                from={_ => { return { opacity: 0 }; }}
                update={item => { return { opacity: item.opacity, left: item.left, top: item.top } }}
                clickable={true}
                animated={(item, props) => <animated.img
                    className='positioned item shadow'
                    src={`./characters/${item.name}.jpg`}
                    alt={item.name}
                    style={{
                        opacity: props.opacity,
                        left: props.left,
                        top: props.top,
                        width: item.width,
                        height: item.height,
                    }} />}
            />
            <AnimatedItems
                items={healthPoints}
                from={_ => { return { opacity: 0, left: 0, top: 0, width, height } }}
                update={item => { return { opacity: 1, left: item.left, top: item.top, width: item.width, height: item.height } }}
                animated={(item, props) => <animated.img
                    key={item.key}
                    className='positioned item'
                    src={`./health/health-${item.color}.png`}
                    alt='health'
                    style={{
                        opacity: props.opacity,
                        left: props.left,
                        top: props.top,
                        width: props.width,
                        height: props.height,
                    }}
                />}
            />
            <AnimatedItems
                items={normalCards}
                update={item => {
                    return {
                        faceUp: item.faceUp ? 1 : 0,
                        sideways: item.sideways ? 1 : 0,
                        opacity: item.opacity,
                        left: item.left,
                        top: item.top,
                        scale: item.scale,
                    };
                }}
                clickable={true}
                animated={(item, props) => {
                    const { faceUp, sideways, opacity, left, top, scale } = props;
                    return <animated.div
                        className={classNames('positioned', 'item', item.className)}
                        style={{
                            transformOrigin: '0 0',
                            transform: interpolate([faceUp, sideways, scale], (faceUp, sideways, scale) =>
                                `scale(${scale}) rotateY(${faceUp * 180 - (faceUp > 0.5 ? 180 : 0)}deg) rotateZ(${sideways * 90}deg)`),
                            opacity,
                            left,
                            top,
                            width: scaledWidth,
                            height: scaledHeight,
                        }}
                    >
                        <animated.img
                            className='fill'
                            src={faceUp.interpolate(faceUp => faceUp > 0.5 ? `./cards/${item.card.type}.jpg` : './cards/Card Back.jpg')}
                            alt={'card'}
                        />
                        <animated.div
                            className={classNames('card-value', {'red': ['DIAMOND', 'HEART'].includes(item.card.suit)})}
                            style={{
                                opacity: faceUp,
                            }}
                        >
                            {item.card.value}
                            <br />
                            {SUITS[item.card.suit]}
                        </animated.div>
                    </animated.div>
                }}
            />
        </div>
    }
}
