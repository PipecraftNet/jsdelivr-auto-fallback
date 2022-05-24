# jsdelivr-auto-fallback

> 修复 cdn.jsdelivr.net 无法访问的问题

由于一些原因，`cdn.jsdelivr.net` 在一些地区无法访问 (如 [issue](https://github.com/jsdelivr/jsdelivr/issues/18397))。在网站里添加上 `jsdelivr-auto-fallback` 代码，可以自动检测 `cdn.jsdelivr.net` 是否可用，
如果不可用时，会自动把所有 **js, css, image** 的地址切换到其他可用的域名。

比如

- `fastly.jsdelivr.net`
- `gcore.jsdelivr.net`
- [更多](index.js)

## 适用场景

如果可以切换到其他 CDN，**建议尽量切换**。如果是以下几种情况，可以考虑使用本项目。

- 网站的大部分用户在中国大陆以外，使用 `cdn.jsdelivr.net` 会更快
- 相信（希望）有一天中国大陆还能正常访问 `cdn.jsdelivr.net`
- 网站切换到其他 CDN 工作量很大，或无法切换
- 网站的图片在 `cdn.jsdelivr.net` 上面

## 添加方法

1. 直接复制 [index.js](index.js) 或 [index.min.js](index.min.js) 里的内容，加到网站里。强烈建议添加到 head 标签最上面。
1. 所有 `script` 标签加上 `defer` 属性。如果原来有 `async` 属性，可以跳过。这个可以避免 `pending` 状态带来的等待时间，大大提升性能。

## Release Note

### v0.2.0 (2022/5/24)

- 检测结果保存到 localStorage，下一次加载时，无需检测，直接使用检测结果中的 fallback domain，缩短等待切换时间
- 考虑网络慢的环境，检测连接 timeout 从 1 秒改回到 2 秒，由于保存检测结果，第二次加载时，比之前版本还快

### v0.1.0 (2022/5/24)

- 从几个可用的域名中，自动选择连接最快的域名 ([#5](https://github.com/PipecraftNet/jsdelivr-auto-fallback/issues/5))
- 检测连接 timeout 从 2 秒改为 1 秒，缩短等待切换时间

### v0.0.3 (2022/5/22)

- 替换内联样式 style 中 url() 中的内容
- 优化代码，缩小代码量

### v0.0.2 (2022/5/20)

- 为了提升性能，检测方式由 `img` 标签改成 `link` 标签 (css)
- 建议 `script` 标签都加上 `defer` 属性，可以大大提升性能
- `timeout` 时间由 3 秒改成 2 秒

## 问题反馈

<https://github.com/PipecraftNet/jsdelivr-auto-fallback/issues>

## License

Copyright (c) 2022 [Pipecraft](https://www.pipecraft.net). Licensed under the [MIT license](LICENSE).

## >\_

[![Pipecraft](https://img.shields.io/badge/site-pipecraft-brightgreen)](https://www.pipecraft.net)
[![PZWD](https://img.shields.io/badge/site-pzwd-brightgreen)](https://pzwd.net)
[![BestXTools](https://img.shields.io/badge/site-bestxtools-brightgreen)](https://www.bestxtools.com)
