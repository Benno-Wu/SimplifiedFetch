describe('Init node test', () => {
    test('get fetch & abort & SimplifiedFetch & pipes', () => {
        expect([
            typeof fetch,
            typeof AbortController,
            typeof AbortSignal,
            typeof SimplifiedFetch,
            typeof SimplifiedFetch.default,
            typeof SimplifiedFetch.API,
            typeof SimplifiedFetch.urnParser,
            Object.keys(pipes),
            typeof URLSearchParams,
            typeof FormData,
        ]).toEqual([
            'function',
            'function',
            'function',
            'object',
            'function',
            'undefined',
            'function',
            ['NoRequest', 'RequestDelay', 'RequestLogger'],
            'function',
            'function',
        ])
    })
    test('wow', async () => {
        SimplifiedFetch.default.init({
            method: 'POST',
            baseURL: 'https://jsonplaceholder.typicode.com',
        }, {
            getUser: {
                urn: '/user',
                config: {
                    method: 'GET',
                }
            },
        })
        expect(await Api.getUser()).toEqual({})
    })
})
