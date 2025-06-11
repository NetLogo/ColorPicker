export default {
  modulePaths: ["<rootDir>/out/javascripts/"]
, moduleNameMapper: {
    "picker/(.*)": ["<rootDir>/out/javascripts/$1"]
  }
, moduleDirectories: ["<rootDir>/node_modules/"]
, setupFiles:        ["<rootDir>/out/deps/nl-color-model.js"]
, testMatch:         ["<rootDir>/test/*.js"]
, testEnvironment:   "jsdom"
};
