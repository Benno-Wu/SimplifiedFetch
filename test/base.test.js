const puppeteer = require("puppeteer-core")
const fs = require('fs')

const script = fs.readFileSync('.\\test\\src\\index.min.js').toString()

let browser, page

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: true,
        // headless: false,
        devtools: true,
        // https://docs.microsoft.com/en-us/microsoft-edge/puppeteer/
        executablePath: `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`,
    })
    page = await browser.newPage()
    // await page.goto('https://example.com')
    page.on('console', async _ => {
        for (let i = 0; i < _.args().length; ++i) {
            // let __ = await _.args()[i].jsonValue()
            // console.log(`log: ${_.args()[i]},${_}`)
            console.log(`log: ${_.args()[i]}`)
        }
    })
    page.on('pageerror', _ => { console.log('error: ', _); })
    page.on('request', _ => console.log('req: ', [_.headers(), _.postData(), _.url()]))
    page.on('requestfailed', _ => console.log('reqF: ', [_.headers(), _.postData(), _.url()]))
    // page.on('response', _ => console.log('res: ', [_.headers(), _.json(), _.url()]))
    // page.on('requestfinished', async _ => { _ = _.response(); console.log('res: ', [_.headers(), await _.json(), _.url()]) })

    await page.addScriptTag({ content: script })
})

afterAll(async () => {
    await browser.close()
})

describe('Simplified Fetch Test', () => {

    test('API create', async () => {
        const _ = await page.evaluate(async () => {
            return globalThis.api = test.API.create({
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
            return test.API.init({
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
        console.log(_);
        expect(_).toEqual({ ...user, id: 11 })
    })
})
