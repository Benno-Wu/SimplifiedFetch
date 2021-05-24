const fs = require('fs')
const script = fs.readFileSync('.\\test\\pipes.js').toString()

describe('Before version 0.5', () => {
    beforeAll(async () => {
        const _ = await page.evaluate(async () => {
            return test.default.init({
                baseURL: 'https://www.example.com'
            }, {
                urnStringTest: 'test',
                customConfigTest: {
                    urn: 'test', config: { custom: { customTag: true } }
                },
            })
        })
        await page.addScriptTag({ content: script })
    })

    describe('URN type string test', () => {
        test('URN type string', async () => {
            const _ = await page.evaluate(async () => {
                const final = {}
                const _ = Api.request.use((url, config) => {
                    final.url = url.toString()
                })
                const logger = Api.request.use(pipes.RequestLogger)
                const noRequest = Api.request.use(pipes.NoRequest)
                try {
                    await Api.urnStringTest()
                } catch (e) {
                    final.e = e
                }
                Api.request.eject([_, logger, noRequest])
                return final
            })
            expect(_).toEqual({
                e: 'No Request',
                url: 'https://www.example.com/test'
            })
        })
    })

    describe('Custom config test', () => {
        test('try to get custom config', async () => {
            const _ = await page.evaluate(async () => {
                let final = false
                const _ = Api.request.use((url, config) => {
                    final = config.custom.customTag
                }, pipes.NoRequest)
                try {
                    await Api.customConfigTest()
                } catch (e) {
                }
                Api.request.eject(_)
                return final
            })
            expect(_).toBeTruthy()
        })
    })
})