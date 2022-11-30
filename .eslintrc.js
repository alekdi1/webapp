const isProd = process.env.NODE_ENV === "production"

module.exports = {
  root: true,
  env: {
    node: true
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    "no-console": "off",
		"no-debugger": isProd ? "warn" : "off",
		"quotes": ["warn", "double", { "allowTemplateLiterals": true }],
		"indent": "off",
		"disallowTabs": "off",
		"no-tabs": "off",
		"no-return-assign": "off",
		"space-before-function-paren": "off",
		"@typescript-eslint/ban-ts-ignore": "off",
		"@typescript-eslint/camelcase": "off",
		"@typescript-eslint/no-use-before-define": "off",
		"@typescript-eslint/member-delimiter-style": "off",
		"padded-blocks": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"template-curly-spacing": "off",
    "require-atomic-updates": "off"
  }
}
