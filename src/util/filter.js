/* eslint-disable */

export function weather(value) {
    let map = {
        'rainy': '雨',
        'sunny': '晴',
        'cloudy': '多云',
    }
    return map[value] || value
}

export default {
    weather
}