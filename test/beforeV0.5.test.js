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
                    urn: 'customConfigTest', config: { custom: { customTag: true } }
                },
            })
        })
        await page.addScriptTag({ content: script })
    })

    describe('APIConfig type URN test', () => {
        test('APIConfig type string', async () => {
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
        test.todo('APIConfig type function')
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
                } catch (e) { }
                Api.request.eject(_)
                return final
            })
            expect(_).toBeTruthy()
        })
    })

    describe('Async PipeRequest', () => {
        test('Async PipeRequest Delay', async () => {
            const _ = await page.evaluate(async () => {
                let t1, t2
                const _ = Api.request.use(() => { t1 = Date.now() },
                    pipes.RequestDelay(1000),
                    () => { t2 = Date.now() },
                    pipes.NoRequest)
                try {
                    await Api.customConfigTest()
                } catch (e) { }
                Api.request.eject(_)
                return t2 - t1 > 1000
            })
            expect(_).toBeTruthy()
        })
    })

    describe('Dynamic config', () => {
        test('Dynamic config', async () => {
            const _ = await page.evaluate(async () => {
                let final = {}
                const _ = Api.request.use((url, config) => {
                    final.dynamic = config?.custom?.customTag
                    final.method = config?.method
                }, pipes.NoRequest)
                try {
                    await Api.urnStringTest(null, null, { method: 'POST', custom: { customTag: true } })
                } catch (e) { }
                Api.request.eject(_)
                return final
            })
            expect(_).toEqual({
                dynamic: true,
                method: 'POST'
            })
        })
        test('Config custom with object.assign', async () => {
            const _ = await page.evaluate(async () => {
                let final = {}
                const _ = Api.request.use((url, config) => {
                    final.customTag = config?.custom?.customTag
                    final.tag = config?.custom?.tag
                }, pipes.NoRequest)
                try {
                    await Api.customConfigTest(null, null, { custom: { customTag: false, tag: true } })
                } catch (e) { }
                Api.request.eject(_)
                return final
            })
            expect(_).toEqual({
                customTag: false,
                tag: true
            })
        })
    })

    describe('Params parse to url.search', () => {
        test.todo('next version')
    })

})