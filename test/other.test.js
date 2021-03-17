describe('Simplified Fetch Other Test', () => {
    beforeAll(async () => {
        await page.evaluate(async () => {
            return test.API.init({
                method: 'POST',
                baseURL: 'https://jsonplaceholder.typicode.com',
            }, {
                get: {
                    urn: url => url,
                    config: {
                        method: 'GET',
                    }
                },
                post: {
                    urn: url => url,
                },
                abortUser: {
                    urn: '/users',
                    config: {
                        enableAbort: true,
                    }
                },
                timeoutUser: {
                    urn: '/users',
                    config: {
                        enableAbort: 50,
                    }
                },
                getUserWithRes: {
                    urn: '/users',
                    config: {
                        method: 'GET',
                        pureResponse: true,
                    }
                },
                pipeUser: {
                    urn: undefined,
                    config: undefined,
                }
            })
        })
        const _ = await page.evaluate(() => {
            return Api
        })
        expect(_).toHaveProperty('request')
        expect(_).toHaveProperty('response')
    })

    describe('methods shorthand', () => {
        test('get with number', async () => {
            const _ = await page.evaluate(async () => {
                return await Api.get(1, '/users')
            })
            expect(_.id).toBe(1)
            expect(_.username).toBe('Bret')
        })
        test('get with object', async () => {
            const id = 1
            const _ = await page.evaluate(async (id) => {
                return await Api.get({ id }, '/users')
            }, id)
            expect(_).toHaveLength(1)
            expect(_[0].id).toBe(1)
        })
        test('post Array', async () => {
            const users = new Array(3).fill(0).map(i => ({ name: 'test' }))
            const _ = await page.evaluate(async (users) => {
                return await Api.post(users, '/users')
            }, users)
            // public api not so good
            expect(_[0].name).toBe('test')
        })
    })

    describe('AbortController', () => {
        test('abort', async () => {
            const _ = await page.evaluate(async () => {
                const [abortController, signal] = Api.aborts.abortUser
                setTimeout(() => abortController.abort(), 50)
                try {
                    await Api.abortUser()
                } catch (error) {
                    // unable to JSON.stringfy()
                    // Object.getOwnPropertyDescriptors(signal)={} 
                    return [{ name: error.name, message: error.message }, { aborted: signal.aborted, timeout: signal.timeout }]
                }
            })
            expect(_[0].name).toBe('AbortError')
            expect(_[1].aborted).toBeTruthy()
            expect(_[1].timeout).toBeUndefined()
        })
        test('timeout', async () => {
            const _ = await page.evaluate(async () => {
                const [abortController, signal] = Api.aborts.timeoutUser
                signal.onabort = () => {
                    console.log('Gotcha! ', signal.timeout)
                }
                try {
                    await Api.timeoutUser()
                } catch (error) {
                    return [{ name: error.name, message: error.message }, { aborted: signal.aborted, timeout: signal.timeout }]
                }
            })
            expect(_[0].name).toBe('AbortError')
            expect(_[1].aborted).toBeTruthy()
            expect(_[1].timeout).toBe(50)
        })
    })

    describe('pure Response', () => {
        test('with pureResponse', async () => {
            const _ = await page.evaluate(async () => {
                const _ = await Api.getUserWithRes()
                return [_[0], _[1] instanceof Response, _[1].bodyUsed]
            })
            expect(_[0]).toHaveLength(10)
            expect(_[1]).toBeTruthy()
            expect(_[2]).toBeFalsy()
        })
    })

    describe('Pipeline', () => {
        test('request pipe', async () => {
            const _ = await page.evaluate(async () => {
                const final = {}
                const key = Api.request.use((url, config, [body, param], [api, urn, configF, configB]) => {
                    final.body = body
                    final.param = param
                    final.api = api
                    final.urn = urn + ''
                    final.configF = configF
                    url.pathname = url.pathname.replace('undefined', '')
                    url.pathname += 'users'
                    config.method = 'GET'
                    Reflect.deleteProperty(config, 'body')
                })
                final.requestMapSize = Api.request.pipeMap.size
                const result = await Api.pipeUser({ test: 'test' }, 'test')
                Api.request.eject(key)
                final.size = Api.request.pipeMap.size
                final.resultLen = result.length
                return final
            })
            expect(_).toEqual({
                body: { test: 'test' },
                param: 'test',
                api: 'pipeUser',
                urn: 'undefined',
                configF: {},
                requestMapSize: 1,
                size: 0,
                resultLen: 10,
            })
        })
        test.only('response pipe', async () => {
            const _ = await page.evaluate(async () => {
                const final = {}
                const key = Api.request.use((url, config) => {
                    url.pathname = url.pathname.replace('undefined', '')
                    url.pathname += 'users'
                    config.method = 'GET'
                    Reflect.deleteProperty(config, 'body')
                })
                final.reqL = Api.request.pipeMap.size
                const key2 = Api.response.use(async (response, request, [resolve, reject]) => {
                    final.bodyUsed = response.bodyUsed
                    console.log(response.bodyUsed)
                    const res = await response.json()
                    console.log(res);
                    final.bodyUndefined = request.body === undefined
                    final.ok = response.ok
                    final.used = response.bodyUsed
                    resolve(res.map(obj => ({ test: 'test' })))
                    return true
                })
                Api.response.use(() => console.log('Gotcha BUG!'))
                final.resL = Api.response.pipeMap.size
                const result = await Api.pipeUser({ whatever: 'whatever' })
                console.log('???');
                final.result = result
                return final
            })
            console.log(_)
            expect(_).toEqual({
                reqL: 1, resL: 2,
                bodyUndefined: true,
                bodyUsed: false,
                ok: true,
                used: true,
                result: new Array(10).fill({ test: 'test' })
            })
        })
        test.todo('response pipe reject')
    })

    describe('suffix', () => {
        test.todo('suffix')
    })
})
