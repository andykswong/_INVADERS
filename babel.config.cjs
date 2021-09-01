module.exports = api => {
  const isTest = api.env('test');

  const config = {
    "presets": [
      ["@babel/preset-env", { "modules": false, "targets": { "node": true } }],
      ["@babel/preset-typescript"]
    ],
    "plugins": [
      ["./babel.transform.cjs"]
    ],
    "comments": false,
    "minified": !isTest
  };

  return config;
};
