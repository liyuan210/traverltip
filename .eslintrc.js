module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 代码质量规则
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    
    // 代码风格规则
    'indent': ['error', 4],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    
    // ES6+ 规则
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'template-curly-spacing': 'error',
    
    // 性能相关规则
    'no-loop-func': 'error',
    'no-inner-declarations': 'error',
    
    // 安全相关规则
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-script-url': 'error'
  },
  globals: {
    // 全局变量
    'gtag': 'readonly',
    'workbox': 'readonly'
  },
  overrides: [
    {
      files: ['sw.js', 'sw-*.js'],
      env: {
        serviceworker: true,
        browser: false
      },
      globals: {
        'self': 'readonly',
        'caches': 'readonly',
        'clients': 'readonly'
      }
    },
    {
      files: ['vite.config.js', 'scripts/*.js'],
      env: {
        node: true,
        browser: false
      }
    }
  ]
}