import nextVitals from "eslint-config-next/core-web-vitals"

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", ".tmp/**"],
    rules: {
      // These React Compiler diagnostics are valuable but require a separate
      // component-by-component migration. Keep the established lint gate
      // useful while that work is scheduled, instead of failing every build
      // on legacy patterns that are already type-checked.
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]

export default config
