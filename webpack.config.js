const path = require('path');

module.exports = (env) => {
    const target = env.target || 'firefox'; // Default to firefox if no target specified

    return {
        name: target,
        entry: `./${target}/content.js`,
        output: {
            filename: 'content.bundle.js',
            path: path.resolve(__dirname, target)
        },
        mode: 'production'
    };
};