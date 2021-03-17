const puppeteer = require("puppeteer-core")
const fs = require('fs')
const script = fs.readFileSync('.\\test\\src\\index.min.js').toString()

// let browser, page
// how this works? unknown, but each jest test has own context, so there will be many browser instances
// https://github.com/facebook/jest/issues?q=is%3Aissue+global+beforeAll
// may helpful
// https://github.com/facebook/jest/issues/7184
// https://github.com/facebook/jest/issues/3832
// https://github.com/facebook/jest/issues/4118

beforeAll(async () => {
    global.browser = await puppeteer.launch({
        headless: true,
        // headless: false,
        devtools: true,
        // https://docs.microsoft.com/en-us/microsoft-edge/puppeteer/
        executablePath: `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`,
    })
    global.page = await browser.newPage()
    // await page.goto('https://example.com')
    page.on('console', async _ => {
        for (let i = 0; i < _.args().length; ++i) {
            // let __ = await _.args()[i].jsonValue()
            // console.log(`log: ${_.args()[i]},${_}`)
            console.log(`log: ${_.args()[i]}`)
        }
    })
    page.on('pageerror', _ => { console.log('error: ', _) })
    page.on('request', _ => console.log('req: ', [_.headers(), _.postData(), _.url()]))
    page.on('requestfailed', _ => console.log('reqF: ', [_.headers(), _.postData(), _.url()]))
    // page.on('response', _ => console.log('res: ', [_.headers(), _.json(), _.url()]))
    // page.on('requestfinished', async _ => { _ = _.response(); console.log('res: ', [_.headers(), await _.json(), _.url()]) })

    await page.addScriptTag({ content: script })
})

afterAll(async () => {
    // jest.setTimeout = 5s, don't greater then 5000, or change the config
    // await sleep(3000)
    await page.waitForTimeout(3000)
    await browser.close()
})

const sleep = (num) => new Promise(res => setTimeout(res, num))