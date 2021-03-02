module.exports = {
    client: {
        includes: ['/src/**/*.ts'],
        service: {
            name: 'listings',
            url: 'http://localhost:9000/api',
        }
    }
}