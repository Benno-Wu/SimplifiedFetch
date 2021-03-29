describe('Simplified Fetch Base Test', () => {
    beforeAll(async () => {
        const _ = await page.evaluate(async () => {
            return globalThis.api = test.default.create({
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
        })
        expect(_.getUser).toEqual({})
    })

    test('API init', async () => {
        await page.evaluate(async () => {
            return test.default.init({
                method: 'POST',
                baseURL: 'https://jsonplaceholder.typicode.com',
            }, {
                getUser: {
                    urn: '/users',
                    config: {
                        method: 'GET',
                    }
                },
                get: {
                    urn: test.urnParser`/${0}/${2}/${1}`,
                    config: {
                        method: 'GET',
                    }
                },
                getPostsByUserID: {
                    urn: '/posts',
                    config: {
                        method: 'GET',
                    }
                },
                putUserById: {
                    urn: test.urnParser`/users/${0}`,
                    config: {
                        method: 'PUT',
                    }
                },
                postUser: {
                    urn: '/users',
                }
            })
        })
        const _ = await page.evaluate(() => {
            return Api
        })
        expect(_).toHaveProperty('request')
        expect(_).toHaveProperty('response')
    })

    test('try get user without id', async () => {
        const _ = await page.evaluate(async () => {
            return await Api.getUser()
        })
        // expect(_.length).toBe(10)
        expect(_).toHaveLength(10)
    })
    test('try get user with id', async () => {
        const id = 1
        const _ = await page.evaluate(async (id) => {
            return await Api.getUser(id)
        }, id)
        expect(_.id).toBe(id)
        expect(_.name).toBe('Leanne Graham')
    })
    test(`try get user'todos with his id`, async () => {
        const id = 1
        const _ = await page.evaluate(async (id) => {
            return await Api.get(undefined, ['users', 'todos', id])
        }, id)
        expect(_).toHaveLength(20)
        expect(_[0].completes).toBeFalsy()
    })
    test(`try get user'albums with his id`, async () => {
        const id = 1
        const _ = await page.evaluate(async (id) => {
            return await Api.get(undefined, ['users', 'albums', id])
        }, id)
        expect(_).toHaveLength(10)
        expect(_[0].title).toBe('quidem molestiae enim')
    })

    test(`try get posts by userId`, async () => {
        const id = 1
        const _ = await page.evaluate(async (id) => {
            return await Api.getPostsByUserID({ userId: id })
        }, id)
        expect(_).toHaveLength(10)
        expect(_[0].id).toBe(1)
    })

    test(`try put user by id`, async () => {
        const id = 1
        const _ = await page.evaluate(async (id) => {
            return await Api.putUserById({ name: 'test', email: 'test@test.com' }, [1])
        }, id)
        expect(_.name).toBe('test')
        expect(_).not.toHaveProperty('username')
    })

    test(`try post new user`, async () => {
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
            return await Api.postUser(user)
        }, user)
        expect(_).toEqual({ ...user, id: 11 })
    })
})
