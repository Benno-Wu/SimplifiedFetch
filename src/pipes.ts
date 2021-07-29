import { PipeRequest } from "./type&interface";

export const NoRequest: PipeRequest = (url, config, [body, params], [api, urn, config_, baseConfig]) => {
    console.log(`try fetch ${url}, blocked by NoRepuest Pipe`)
    return 'No Request'
}

export const RequestLogger: PipeRequest = (url, config, [body, params, dynamicConfig], [api, urn, config_, baseConfig]) => {
    console.log('RequestLogger begin')
    console.log(url.toString(), JSON.stringify(config), JSON.stringify([body, params, dynamicConfig]), JSON.stringify([api, urn, config_, baseConfig]))
    console.log('RequestLogger end')
}

export const RequestDelay: (delay: number) => PipeRequest = (delay: number) => async () => {
    await new Promise(resolve => setTimeout(resolve, delay))
}