import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    ignores: ['node_modules/**', 'public/**'],
  },
  {
    ...eslintConfigPrettier,
    plugins: {
      ...eslintConfigPrettier.plugins, // nécessaire avant intégration plugin Prettier
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules, // suppression des règles de style proposées par ESLint
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          plugins: ['prettier-plugin-brace-style'], // ajoute le formatage stroustrup à Prettier
          braceStyle: 'stroustrup',
        },
      ],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
];
