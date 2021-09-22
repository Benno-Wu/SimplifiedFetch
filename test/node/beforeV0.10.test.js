describe('Before version 0.10', () => {
  beforeAll(async () => {
    const _ = await (async () => {
      SimplifiedFetch.default.init({
        baseURL: 'https://www.example.com',
        methodInName: name => {
          const methods = {
            GET: /^get.*/,
            POST: /^(post|update).*/,
            DELETE: /^del.*/
          };

          for (const key in methods) {
            if (Object.hasOwnProperty.call(methods, key)) if (methods[key].test(name)) return key;
          }
        }
      }, {
        getsth: '',
        updatesth: '',
        delsth: ''
      });
    })();
  });
  describe('method in name', () => {
    test('get update del something', async () => {
      const _ = await (async () => {
        const final = [];

        const _ = Api.request.use((url, config) => {
          final.push(config.method);
        });

        const NoRequest = Api.request.use(pipes.NoRequest);

        try {
          await Api.getsth();
        } catch (e) {}

        try {
          await Api.updatesth();
        } catch (e) {}

        try {
          await Api.delsth();
        } catch (e) {}

        return final;
      })();

      expect(_).toEqual(['GET', 'POST', 'DELETE']);
    });
  });
});