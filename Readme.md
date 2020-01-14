思路： https://docs.qq.com/doc/DQ3VFVUl1alVFdlda
方块图 https://docs.qq.com/slide/DQ2tPR0JVZGlUSXpr

其他：
https://docs.qq.com/doc/DQ2N2Y0tZS1BYS2Vp
https://docs.qq.com/doc/DQ0xSZkp6dGVUVHB1


使用 DSL 描述状态机

为了解决上述问题，llhttp 使用了一种基于 TypeScript 的 DSL（领域特定语言） llparse，用于描述有限状态机。

llparse 支持将描述状态机的 TypeScript 编译为 LLVM Bitcode（这也是为啥叫 llparse 的原因）、或者 C 语言、或者 JavaScript。它起码有以下几种优势：

不需要手写大量重复的状态机转换的代码
可以输出到多种语言，其中 llhttp 使用的是 C 语言
可以在编译期间对状态机进行静态分析和优化，合并冗余的状态
llparse 快速入门

现在关于 llparse 的文档和文章几乎没有，llparse 本身也只有 Fedor Indutny 一个维护者，所以想要理解 llparse 的 API 是有一定难度的。

简单介绍

llparse 使用 TypeScript 描述一个专用于匹配文本的状态机，所以它的一切 API 都是为描述一个这样的状态机而设计的。

在 llparse 中，所有状态都是一个节点（node）：

// 创建一个状态 foo
const foo = p.node('foo')
我们可以通过各种 API 来描述节点之间的转换关系，或者各种状态机的动作，这些 API 包括但不仅限于：

match
otherwise
peek
skipTo
select
invoke
code
span
下面分别介绍这些 API。

match 与 otherwise

.match() 表示在当前状态时，尝试匹配一串连续输入。

下面这段代码尝试连续匹配 'hello'，如果匹配成功，那么跳转到下一个节点 nextNode；否则调用 .otherwise() 跳转到 onMismatch：

const foo = p.node('foo')
foo.match('hello', nextNode).otherwise(onMismatch)
peek 与 skipTo

.peek() 表示提前查看下一个字符（ peek 有“偷窥”的意思），但是不消费它。

下面的代码表示，当下一个字符是 '\n' 的时候，跳转到 nextNode，否则使用 .skipTo() 消费一个字符，跳回到 foo 重新循环。

foo.peek('\n', nextNode).skipTo(foo)
注意，.skipTo() 和 .otherwise() 的区别在于， 前者会消费一个字符，而后者不会。

所以如果我们使用 .otherwise() 替换上面的 .skipTo()，就会收到一个错误，告诉我们检测到了死循环：

foo.peek('\n', nextNode).otherwise(foo)
//=> Error: Detected loop in "foo" through chain "foo"
select

.select() 用于匹配一串文本，并且把匹配到的文本映射到某个值上，然后把这个值传入下一个状态。

foo.select({
    'GET': 0,
    'POST': 1
}, next)
比如，在接收 HTTP 请求的时候，根据规范，开头的前几个字符必然是 HTTP 方法名，那么我们可以这样接收：

const method = p.node('method')
method
  .select({
    'HEAD': 0, 'GET': 1, 'POST': 2, 'PUT': 3,
    'DELETE': 4, 'OPTIONS': 5, 'CONNECT': 6,
    'TRACE': 7, 'PATCH': 8
  }, onMethod)
  .otherwise(p.error(5, 'Expected method'))
invoke 与 code

任何有意义的状态机最终肯定是要对外部产生输出的，比如调用外部函数，或者存储一些状态到外部的属性上面，.invoke() 和 .code 就是为此而设计的。

.invoke() 调用一个外部函数，并且根据外部函数的返回值，映射到不同的下个状态，如果没有映射，那么跳入错误状态中。

.code.match() 返回一个外部函数的引用。

const onMatch = p.invoke(
    p.code.match("bar"),
    {
        1: nextNode1,
        2: nextNode2
    },
    p.error(1, "bar error")
)
我们这里调用了外部函数 bar，并且根据返回值确定下一个状态 nextNode1 或 nextNode2，如果返回值是预期外的，那么跳入错误状态。

span

.span() 表示在一段时间内，为输入的每个字符产生一次回调。

const callback = p.code.span('onByte')
const onByte = p.span(callback)

node.match('start', onByte.start(nextNode))

nextNode.match('end', onByte.end(nextNextNode))
上面我们尝试匹配 'start'，如果匹配成功，那么跳入 nextNode，并且开始为每个匹配到的字符触发 onByte() 回调，直到匹配完毕 'end'，我们结束触发回调，并且跳入 nextNextNode。

使用 llparse 构建简单的 Parser

单纯地讲 API 是很枯燥的，我们来实战试一试，我们尝试构建一个匹配 'hello' 的 Parser。

首先我们创建一个 start 状态节点，代表起始状态：

import { LLParse } from "llparse"
const p = new LLParse("myfsm")

const start = p.node('start')
我们可以尝试使用 .match() 连续匹配一串输入，如果匹配成功，那么跳转到下一个状态节点 onMatch；否则跳转到 onMismatch：

start
    .match('hello', onMatch)
    .otherwise(onMismatch)
然后 onMatch 中，我们使用 .invoke() 产生一个外部调用，调用的是注入的外部方法 onMatch，如果它返回 0，那么就跳转回到 start 状态，否则报错

const onMatch = p.invoke(
    p.code.match("onMatch"),
    {
        0: start
    },
    p.error(1, "onMatch error")
)
于是我们就得到了这样一个简单的状态机：


总结

llhttp 使用有限状态机解析 HTTP 协议，保证性能的同时也提升了代码的可维护性；
为了使状态机的代码简洁明了，llparse 被设计了出来，这是一门基于 TypeScript 的用于描述解析文本的状态机 DSL；
llparse 提供了一系列 API 对状态机的行为进行抽象，并且可以把状态机编译到 LLVM Bitcode、C、JavaScript；
参考资料

llhttp - new HTTP 1.1 parser for Node.js by Fedor Indutny | JSConf EU 2019
https://indutny.github.io/jsconfeu-2019/reveal.js/index.html
https://github.com/nodejs/http-parser
https://github.com/nodejs/llhttp
https://github.com/nodejs/llparse