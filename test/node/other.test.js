describe('Simplified Fetch Other Test', () => {
  beforeAll(async () => {
    await (async () => {
      return SimplifiedFetch.default.init({
        method: 'POST',
        baseURL: 'https://jsonplaceholder.typicode.com'
      }, {
        get: {
          urn: url => url,
          config: {
            method: 'GET'
          }
        },
        post: {
          urn: url => url
        },
        abortUser: {
          urn: '/users',
          config: {
            enableAbort: true
          }
        },
        timeoutUser: {
          urn: '/users',
          config: {
            enableAbort: 50
          }
        },
        getUserWithRes: {
          urn: '/users',
          config: {
            method: 'GET',
            pureResponse: true
          }
        },
        pipeUser: {
          urn: undefined,
          config: undefined
        },
        suffix: {
          urn: '/test',
          config: {
            method: 'GET',
            suffix: '.test'
          }
        }
      });
    })();

    const _ = await (() => {
      return Api;
    })();

    expect(_).toHaveProperty('request');
    expect(_).toHaveProperty('response');
  });
  describe('methods shorthand', () => {
    test('get with number', async () => {
      const _ = await (async () => {
        return await Api.get(1, '/users');
      })();

      expect(_.id).toBe(1);
      expect(_.username).toBe('Bret');
    });
    test('get with object', async () => {
      const id = 1;

      const _ = await (async id => {
        return await Api.get({
          id
        }, '/users');
      })(id);

      expect(_).toHaveLength(1);
      expect(_[0].id).toBe(1);
    });
    test('post Array', async () => {
      const users = new Array(3).fill(0).map(i => ({
        name: 'test'
      }));

      const _ = await (async users => {
        return await Api.post(users, '/users');
      })(users);

      expect(_[0].name).toBe('test');
    });
  });
  describe('AbortController', () => {
    test('abort', async () => {
      const _ = await (async () => {
        const [abortController, signal] = Api.aborts.abortUser;
        setTimeout(() => abortController.abort(), 50);

        try {
          await Api.abortUser();
        } catch (error) {
          return [{
            name: error.name,
            message: error.message
          }, {
            aborted: signal.aborted,
            timeout: signal.timeout
          }];
        }
      })();

      expect(_[0].name).toBe('AbortError');
      expect(_[1].aborted).toBeTruthy();
      expect(_[1].timeout).toBeUndefined();
    });
    test('timeout', async () => {
      const _ = await (async () => {
        const [abortController, signal] = Api.aborts.timeoutUser;

        signal.onabort = () => {
          console.log('Gotcha! ', signal.timeout);
        };

        try {
          await Api.timeoutUser();
        } catch (error) {
          return [{
            name: error.name,
            message: error.message
          }, {
            aborted: signal.aborted,
            timeout: signal.timeout
          }];
        }
      })();

      expect(_[0].name).toBe('AbortError');
      expect(_[1].aborted).toBeTruthy();
      expect(_[1].timeout).toBe(50);
    });
  });
  describe('pure Response', () => {
    test('with pureResponse', async () => {
      const _ = await (async () => {
        const _ = await Api.getUserWithRes();

        return [_[0], _[1] instanceof Response, _[1].bodyUsed];
      })();

      expect(_[0]).toHaveLength(10);
      expect(_[1]).toBeTruthy();
      expect(_[2]).toBeFalsy();
    });
  });
  describe('Pipeline', () => {
    test('request pipe', async () => {
      const _ = await (async () => {
        const final = {};
        const key = Api.request.use((url, config, [body, param], [api, urn, configF, configB]) => {
          final.body = body;
          final.param = param;
          final.api = api;
          final.urn = urn + '';
          final.configF = configF;
          url.pathname = url.pathname.replace('/undefined/test', '');
          url.pathname += 'users';
          config.method = 'GET';
          Reflect.deleteProperty(config, 'body');
        });
        const result = await Api.pipeUser({
          test: 'test'
        }, 'test');
        Api.request.eject(key);
        final.resultLen = result.length;
        return final;
      })();

      expect(_).toEqual({
        body: {
          test: 'test'
        },
        param: 'test',
        api: 'pipeUser',
        urn: 'undefined',
        configF: {},
        resultLen: 10
      });
    });
    test('request pipe reject', async () => {
      const _ = await (async () => {
        const final = {};
        const key = Api.request.use((url, config, [body, params], [someApi, urn, configF, configB]) => {
          return 'stop before fetch';
        });
        const key2 = Api.request.use(() => {
          console.log('Gotcha');
          final.gotcha = true;
        });

        try {
          const result = await Api.get(1, '/users');
          final.result = result;
        } catch (error) {
          final.error = error;
        }

        Api.request.eject(key);
        Api.request.eject(key2);
        return final;
      })();

      expect(_).toEqual({
        error: 'stop before fetch',
        gotcha: undefined,
        result: undefined
      });
    });
    test('response pipe resolve', async () => {
      const _ = await (async () => {
        const final = {};
        const key = Api.request.use((url, config) => {
          url.pathname = url.pathname.replace('undefined', '');
          url.pathname += 'users';
          config.method = 'GET';
          Reflect.deleteProperty(config, 'body');
        });
        const keys = Api.response.use(async (response, request, [resolve, reject]) => {
          final.bodyUsed = response.bodyUsed;
          const res = await response.json();
          final.nullishBody = request.body == undefined;
          final.ok = response.ok;
          final.used = response.bodyUsed;
          resolve(res.map(obj => ({
            test: 'test'
          })));
        }, () => {
          console.log('Gotcha!');
          final.gotcha = true;
        });
        const result = await Api.pipeUser({
          whatever: 'whatever'
        });
        final.result = result;
        Api.request.eject(key);
        Api.response.eject(keys);
        return final;
      })();

      expect(_).toEqual({
        nullishBody: true,
        bodyUsed: false,
        ok: true,
        used: true,
        result: new Array(10).fill({
          test: 'test'
        }),
        gotcha: undefined
      });
    });
    test('response pipe reject', async () => {
      const _ = await (async () => {
        const final = {};
        const key = Api.response.use(async (response, request, [resolve, reject]) => {
          const res = await response.json();
          reject(res.id);
        });
        const key2 = Api.response.use(() => {
          console.log('Gotcha!');
          final.gotcha = true;
        });

        try {
          const result = await Api.get(1, '/users');
          final.result = result;
        } catch (error) {
          final.error = error;
        }

        Api.response.eject(key);
        Api.response.eject(key2);
        return final;
      })();

      expect(_).toEqual({
        error: 1,
        result: undefined,
        gotcha: undefined
      });
    });
  });
  describe('suffix', () => {
    test('just suffix', async () => {
      const _ = await (async () => {
        const final = {};
        const key = Api.request.use((url, config) => {
          let regExp = /test/g;
          final.pathname = url.pathname;
          final.len = [...url.pathname.matchAll(regExp)].length;
          return true;
        });

        try {
          const result = await Api.suffix();
          final.result = result;
        } catch (error) {
          final.error = error;
        }

        Api.request.eject(key);
        return final;
      })();

      expect(_).toEqual({
        pathname: '/test.test',
        len: 2,
        error: true
      });
    });
    test('suffix with urlSearchParam', async () => {
      const _ = await (async () => {
        const final = {};
        const key = Api.request.use((url, config) => {
          let regExp = /test/g;
          final.url = url.pathname + url.search;
          final.len = [...(url.pathname + url.search).matchAll(regExp)].length;
          return true;
        });

        try {
          const result = await Api.suffix({
            test: 'test'
          });
          final.result = result;
        } catch (error) {
          final.error = error;
        }

        Api.request.eject(key);
        return final;
      })();

      expect(_).toEqual({
        url: '/test.test?test=test',
        len: 4,
        error: true
      });
    });
  });
});