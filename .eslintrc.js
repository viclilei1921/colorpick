module.exports = {
  // 此项是用来告诉eslint找当前配置文件不能往父级查找
  root: true,
  // 全局环境
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  // 指定如何解析语法。可以为空，但若不为空，只能配该值
  parser: 'vue-eslint-parser',
  // 优先级低于parse的语法解析配置
  parserOptions: {
    // 指定ESlint的解析器
    parser: '@typescript-eslint/parser'
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: ['src/env.d.ts'],
  rules: {
    'import/no-unresolved': [2, { ignore: ['^@', '^\\.'] }],
    '@typescript-eslint/no-var-requires': 0,
    'vue/multi-word-component-names': 0,
    'vue/comment-directive': 0,
    'vue/html-self-closing': [
      0,
      {
        html: {
          void: 'never',
          normal: 'never',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],

    // 在单行元素的内容前后需要换行符
    'vue/singleline-html-element-content-newline': 'off',

    // 在多行元素的内容之前和之后需要换行符
    'vue/multiline-html-element-content-newline': 'off',

    // 强制组件定义名称大小写
    'vue/component-definition-name-casing': ['error', 'PascalCase'],

    // 禁止使用 v-html
    'vue/no-v-html': 'off',

    // 两个空格缩进
    indent: [
      2,
      2,
      {
        SwitchCase: 1
      }
    ],
    // 单引号
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],

    // 未使用的变量
    // 'no-unused-vars': [
    //   2,
    //   {
    //     vars: 'all',
    //     args: 'after-used'
    //   }
    // ],
    '@typescript-eslint/no-unused-vars': [2],

    // 关键字前后空格
    'keyword-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],

    // function关键字和函数名后面的空格
    // 'space-before-function-paren': [2, 'never'],

    // 除了null,其他用===而不是==
    eqeqeq: ['error', 'always', { null: 'ignore' }],

    // 字符串拼接操作符直接用空格
    'space-infix-ops': 2,

    // 逗号前面不用空格，逗号后面用空格
    'comma-spacing': [
      2,
      {
        before: false,
        after: true
      }
    ],

    // else必须和反花括号一行
    'brace-style': [
      2,
      '1tbs',
      {
        allowSingleLine: true
      }
    ],

    // 多行 if 语句的的括号不能省
    curly: [2, 'multi-line'],

    // 使用浏览器全局变量时加上 window. 前缀
    'no-undef': 2,

    // 不允许有连续多行空行
    'no-multiple-empty-lines': [
      2,
      {
        max: 1
      }
    ],

    // 换行符在运算符的位置
    'operator-linebreak': [
      2,
      'after',
      {
        overrides: {
          '?': 'before',
          ':': 'before'
        }
      }
    ],

    // 条件语句中赋值语句
    'no-cond-assign': 2,

    // 单行代码块两边加空格
    'block-spacing': [2, 'always'],

    // 对属性名强制使用驼峰
    camelcase: [
      0,
      {
        properties: 'always'
      }
    ],

    // 不允许有多余的行末逗号
    'comma-dangle': [2, 'never'],

    // 始终将逗号置于行末
    'comma-style': [2, 'last'],

    // 点号操作符须与属性需在同一行
    'dot-location': [2, 'property'],

    // 函数调用时标识符与括号间不留间隔
    'func-call-spacing': ['error', 'never'],

    // 键值对当中冒号与值之间要留空白
    'key-spacing': [
      2,
      {
        beforeColon: false,
        afterColon: true
      }
    ],

    // 构造函数要以大写字母开头, 但调用大写字母开头的函数不一定需要new
    'new-cap': [
      2,
      {
        newIsCap: true,
        capIsNew: false
      }
    ],

    // 无参的构造函数调用时要带上括号
    'new-parens': 2,

    // 对象中定义了存值器，一定要对应的定义取值器
    'accessor-pairs': 2,

    // 子类的构造器中一定要调用 super
    'constructor-super': 2,

    // 使用数组字面量而不是构造器
    'no-array-constructor': 'error',

    // 避免使用 arguments.callee 和 arguments.caller
    'no-caller': 2,

    // 避免对类名重新赋值
    'no-class-assign': 2,

    // 避免修改使用 const 声明的变量
    'no-const-assign': 2,

    'no-constant-condition': 0,

    // 正则中不要使用控制符
    'no-control-regex': 'error',

    // 不要对变量使用 delete 操作。
    'no-delete-var': 2,

    // 不要定义冗余的函数参数
    'no-dupe-args': 2,

    // 类中不要定义冗余的属性
    'no-dupe-class-members': 2,

    // 对象字面量中不要定义重复的属性
    'no-dupe-keys': 2,

    // switch 语句中不要定义重复的 case 分支
    'no-duplicate-case': 2,

    // 同一模块有多个导入时一次性写完
    // 'no-duplicate-imports': 'error',

    // 正则中不要使用空字符
    'no-empty-character-class': 2,

    // 禁止使用混合空格和制表符进行缩进
    'no-mixed-spaces-and-tabs': 2,

    // 禁止多个空格
    'no-multi-spaces': 2,

    // 禁止多行字符串
    'no-multi-str': 2,

    // return禁止出现赋值语句，除非使用括号把它们括起来
    'no-return-assign': [2, 'except-parens'],

    'no-shadow-restricted-names': 2,
    'no-sparse-arrays': 2,
    'no-template-curly-in-string': 'error',
    'no-this-before-super': 2,
    'no-throw-literal': 2,
    'no-trailing-spaces': 2,
    'no-undef-init': 2,

    // 在属性之前禁止空格
    'no-whitespace-before-property': 2,

    // 块语句开始结束没有空格
    'padded-blocks': [2, 'never'],

    // 扩展运算符及其表达式之间不允许有空格
    'rest-spread-spacing': ['error', 'never'],

    // 块语句必须总是至少有一个前置空格
    'space-before-blocks': [2, 'always'],

    // 圆括号内没有空格
    'space-in-parens': [2, 'never'],

    // 一元运算符后需要空格
    'space-unary-ops': 2,

    // 在行注释的//之后立即出现空格
    'spaced-comment': [2, 'always'],

    // 禁止模板字符串花括号出现空格
    'template-curly-spacing': [2, 'never'],

    // 要求使用 isNaN() 检查 NaN
    'use-isnan': 2,

    // typeof 表达式与有效的字符串进行比较
    'valid-typeof': 2,

    // 立即执行函数表达式使用括号包裹起来
    'wrap-iife': [2, 'any'],

    yoda: [2, 'never'],
    // 分号
    semi: [2, 'always'],

    // 箭头函数前后空格
    'arrow-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],

    // 文末使用换行
    'eol-last': 2,

    // JSX 属性中使用双引号
    'jsx-quotes': [2, 'prefer-double'],
    'no-console': 'off',

    // 不允许函数标识符与其应用程序之间存在空格
    'no-spaced-func': 2,

    // 禁用不必要的构造函数
    'no-useless-constructor': 2,

    // 要求使用 const 声明那些声明后不再被修改的变量
    'prefer-const': 2,

    // 要求花括号内有空格 (除了 {})
    'object-curly-spacing': [2, 'always'],

    // 禁止在数组括号内出现空格
    'array-bracket-spacing': [2, 'never'],
    'no-debugger': 2
  }
};

