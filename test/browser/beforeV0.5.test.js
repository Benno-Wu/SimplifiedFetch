describe('Before version 0.5', () => {
    beforeAll(async () => {
        const _ = await page.evaluate(async () => {
            globalThis.mockApi = test.default.create({
                baseURL: 'http://jsonplaceholder.typicode.com/'
            }, {
                fetch1User: 'users/1',
                postUser: {
                    urn: '/users',
                    config: {
                        method: 'POST'
                    }
                }
            })
            return test.default.init({
                baseURL: 'https://www.example.com'
            }, {
                urnStringTest: 'test',
                urnFuncTest: urn => urn,
                customConfigTest: {
                    urn: 'customConfigTest', config: { custom: { customTag: true } }
                },
            })
        })
    })

    describe('APIConfig type URN test', () => {
        test('URN type string', async () => {
            const _ = await page.evaluate(async () => {
                const final = {}
                const _ = Api.request.use((url, config) => {
                    final.url = url.toString()
                })
                const logger = Api.request.use(pipes.RequestLogger)
                const NoRequest = Api.request.use(pipes.NoRequest)
                try {
                    await Api.urnStringTest()
                } catch (e) {
                    final.e = e
                }
                Api.request.eject([0, _[1].concat(logger[1]).concat(NoRequest[1])])
                return final
            })
            expect(_).toEqual({
                e: 'No Request',
                url: 'https://www.example.com/test'
            })
        })
        test('URN type function', async () => {
            const _ = await page.evaluate(async () => {
                let final = ''
                const _ = Api.request.use((url, config) => {
                    final = url.pathname
                }, pipes.NoRequest)
                try {
                    await Api.urnFuncTest(undefined, 'test')
                } catch (e) { }
                Api.request.eject(_)
                return final
            })
            expect(_).toBe('/test')
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
        test('In PipeRequest', async () => {
            const _ = await page.evaluate(async () => {
                let final = {}
                const _ = Api.request.use((url, config, [, , dynamicConfig]) => {
                    final._ = dynamicConfig
                }, pipes.NoRequest)
                try {
                    await Api.urnStringTest(undefined, undefined, { method: 'POST' })
                } catch (e) { }
                Api.request.eject(_)
                return final
            })
            expect(_).toEqual({
                _: { method: 'POST' }
            })
        })
        test('With body & param', async () => {
            const _ = await page.evaluate(async () => {
                let final = {}
                const _ = Api.request.use((url, config) => {
                    final._ = config.method
                    final.pathname = url.pathname
                    final.search = url.search
                }, pipes.NoRequest)
                try {
                    await Api.urnStringTest({ test: 'test' }, 'test', { method: 'HEAD' })
                } catch (e) { }
                Api.request.eject(_)
                return final
            })
            expect(_).toEqual({
                _: 'HEAD',
                pathname: '/test/test',
                search: '?test=test',
            })
        })
    })

    describe('Auto transforming of params & body', () => {
        describe('params', () => {
            test('append pathname: Array, String, Number', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.pathname, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest(undefined, [0, 1])
                    } catch (e) { }
                    try {
                        await Api.urnStringTest(undefined, '/01')
                    } catch (e) { }
                    try {
                        await Api.urnStringTest(undefined, 0)
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual([
                    ['/test/0,1', 'none'],
                    ['/test//01', 'none'],
                    ['/test/0', 'none'],
                ])
            })
            test('append search: Object, FormData, URLSearchParams', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.search, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest(undefined, { a: 0, b: 1 })
                    } catch (e) { }
                    try {
                        let __ = new FormData()
                        __.append('a', 0)
                        __.append('b', 1)
                        await Api.urnStringTest(undefined, __)
                    } catch (e) { }
                    try {
                        await Api.urnStringTest(undefined, new URLSearchParams({ a: 0, b: 1 }))
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual(Array(3).fill(['?a=0&b=1', 'none']))
            })
        })

        describe('body', () => {
            test('append pathname: Array, String, Number', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.pathname, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest([0, 1])
                    } catch (e) { }
                    try {
                        await Api.urnStringTest('/01')
                    } catch (e) { }
                    try {
                        await Api.urnStringTest(0)
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual([
                    ['/test/0,1', 'none'],
                    ['/test//01', 'none'],
                    ['/test/0', 'none'],
                ])
            })
            test('append search: Object, FormData, URLSearchParams', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.search, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest({ a: 0, b: 1 })
                    } catch (e) { }
                    try {
                        let __ = new FormData()
                        __.append('a', 0)
                        __.append('b', 1)
                        await Api.urnStringTest(__)
                    } catch (e) { }
                    try {
                        await Api.urnStringTest(new URLSearchParams({ a: 0, b: 1 }))
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual(Array(3).fill(['?a=0&b=1', 'none']))
            })
        })

        describe('params and body transforming order', () => {
            test('params pathname & body pathname', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.pathname, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest([2, 3], [0, 1])
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual([
                    ['/test/0,1/2,3', 'none'],
                ])
            })
            test('params pathname & body search', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.pathname, url.search, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest({ a: 0, b: 1 }, [0, 1])
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual([
                    ['/test/0,1', '?a=0&b=1', 'none'],
                ])
            })
            test('params search & body pathname', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.pathname, url.search, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest([0, 1], { a: 0, b: 1 })
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual([
                    ['/test/0,1', '?a=0&b=1', 'none'],
                ])
            })
            test('params search & body search', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const _ = Api.request.use((url, config) => {
                        final.push([url.search, config?.body ?? 'none'])
                    }, pipes.NoRequest)
                    try {
                        await Api.urnStringTest({ c: 2, d: 3 }, { a: 0, b: 1 })
                    } catch (e) { }
                    Api.request.eject(_)
                    return final
                })
                expect(_).toEqual([
                    ['?a=0&b=1&c=2&d=3', 'none'],
                ])
            })
        })
    })

    describe('Pipe with order', () => {
        describe('PipeRequest', () => {
            test('use & eject', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const NoRequest = Api.request.use(0b111, (...args) => { final.push(0b111); return pipes.NoRequest(...args) })
                    const order1 = Api.request.use(0b1, () => { final.push(1) })
                    const order0 = Api.request.use(() => { final.push(0) })
                    try {
                        await Api.urnStringTest()
                    } catch (e) { final.push(e) }
                    Api.request.eject(order1)
                    try {
                        await Api.urnStringTest()
                    } catch (e) { final.push(e) }
                    Api.request.eject(order0)
                    Api.request.eject(NoRequest)
                    return final
                })
                expect(_).toEqual([0, 0b1, 0b111, 'No Request', 0, 0b111, 'No Request'])
            })
        })
        describe('PipeResponse', () => {
            test('use & eject', async () => {
                const _ = await page.evaluate(async () => {
                    const final = []
                    const ParseJson = mockApi.response.use(0b11, async (response, req, [res, rej]) => {
                        const json = await response.json()
                        final.push(json.id)
                        res(json)
                    })
                    const order00 = mockApi.response.use(0, () => { final.push('00') })
                    const order0 = mockApi.response.use(() => { final.push(0) })
                    try {
                        await mockApi.fetch1User()
                    } catch (e) { final.push(e.name, e.message) }
                    mockApi.response.eject(order0)
                    try {
                        await mockApi.fetch1User()
                    } catch (e) { final.push(e.name, e.message) }
                    mockApi.response.eject(order00)
                    mockApi.response.eject(ParseJson)
                    return final
                })
                expect(_).toEqual(['00', 0, 1, '00', 1])
            })
        })
        test('Should each PipeResponse gets unique Response and Resquest?', async () => {
            const user = {
                name: 'test',
                phone: 'test',
                address: {
                    street: 'xxx',
                    suite: 'xxx',
                    city: 'xxx',
                }
            }
            const _ = await page.evaluate(async (user) => {
                const final = []
                const use = mockApi.response.use((res, req) => { res.json(); req.json() })
                const used = mockApi.response.use((res, req) => {
                    final.push(res.bodyUsed || req.bodyUsed ? 'NO' : 'YES')
                })
                try {
                    await mockApi.postUser(user)
                } catch (e) { final.push(e.name, e.message) }
                mockApi.response.eject(use)
                mockApi.response.eject(used)
                return final
            }, (user))
            expect(_).toEqual(['YES'])
        })
    })
})