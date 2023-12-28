const fs = require('fs');

function convertNonHtmlTagsToCode(file) {
    // 读取 Markdown 文件内容
    const markdown = fs.readFileSync(file, 'utf8');

    // 正则表达式匹配标签，排除已存在的 HTML 标签
    const regex = /(?<!`)<(?!\/?(?:font|img)\b)(?!(?:[^`]*`[^`]*`)*[^`]*`[^`]*$)[^`>]+>(?!`)/g;
    // const regex = /(?<!`)<(?!(?:[^`]*`[^`]*`)*[^`]*`[^`]*$)[^`>]+>(?!`)/g;

    // 替换非 HTML 标签为 `` 标记
    const convertedMarkdown = markdown.replace(regex, '`$&`');

    // 输出转换后的结果
    // console.log(convertedMarkdown);
    fs.writeFileSync(file, convertedMarkdown)
}
const directoryPath = 'D:\\VSCodeProjects\\codefather2.0\\src\\docs\\Java\\微服务\\2 SpringCloud.md'; // 替换为你的目录路径
convertNonHtmlTagsToCode(directoryPath);