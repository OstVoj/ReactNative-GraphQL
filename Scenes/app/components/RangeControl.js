import React, { Component } from 'react';
import { connectStyle } from 'native-base';
import { ScrollView } from 'react-native';

import MultiSlider from '@ptomasroos/react-native-multi-slider';

export class RangeControl extends Component {
    /**
     * RangeControl
     *
     * @param {Function} onChange callback on change with one (range) param of type {min: number, max: number}
     * @param {Object} range initial range of type {min: number, max: number}
     * @param {Number} width the width of control
     * @param {Array} bounds array [number, number] with lower and upper max bound
     */

    constructor(props) {
        super(props);

        this.state = {
            scrollEnabled: false,
        };
    }

    enableScroll = () => {
        this.setState({ scrollEnabled: true });
    }

    disableScroll = () => {
        this.setState({ scrollEnabled: false });
    }

    multiSliderValuesChange = (values) => {
        const range = { min: values[0], max: values[1] };
        if (this.props.onChange) this.props.onChange(range);
    }

    render() {
        const { bounds, width } = this.props;
        return (
            <ScrollView style={{ flex: 1, paddingLeft: 25 }} scrollEnabled={this.state.scrollEnabled}>
                <MultiSlider
                    style={{ flex: 1 }}
                    onValuesChangeStart={this.disableScroll}
                    onValuesChangeFinish={this.enableScroll}
                    selectedStyle={{
                        backgroundColor: '#FF0091',
                    }}
                    values={[
                        this.props.range.min,
                        this.props.range.max,
                    ]}

                    sliderLength={width}
                    onValuesChange={this.multiSliderValuesChange}
                    min={bounds[0]}
                    max={bounds[1]}
                    step={10}
                    allowOverlap
                    snapped
                />
            </ScrollView>
        );
    }
}

const styles = {

}

export default connectStyle('RangeControl', styles)(RangeControl);