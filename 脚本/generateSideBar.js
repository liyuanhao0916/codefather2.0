const fs = require('fs')
const path = require('path')
// import fs from 'fs'
// import path from 'path'

function generateFileList(directory) {
    const result = []

    const files = fs.readdirSync(directory)
    files.forEach((file) => {
        const filePath = path.join(directory, file)
        const stats = fs.statSync(filePath)

        if (stats.isDirectory()) {
            const children = generateFileList(filePath)
            result.push({
                isFile: false,
                text: file,
                collapsible: true,
                children
            })
        } else if (stats.isFile()) {
            const fileName = path.basename(filePath) // 获取文件名
            if (fileName.includes('README') || fileName.charAt(0) === '.') {
                return     // 不需要Readme 和 .开头的文件, 跳过
            }
            const parentDirName = path.basename(path.dirname(filePath)) // 获取父目录名称
            result.push({
                text: fileName,
                isFile: true,
            })
        }
    })

    return result
}

function generateSideBar(directoryPath) {
    const file = fs.lstatSync(directoryPath)

    if (fs.existsSync(directoryPath) && file.isDirectory()) {
        const fileList = generateFileList(directoryPath)

        let result = `
        import { SidebarArrayOptions } from "vuepress-theme-hope"
        import defaultSideBar from "./defaultSideBar";\n
        export default [
           ...defaultSideBar,\n
            `

        if (fileList[0].isFile) {
            result += `  {\n`
            result += `    text: "${path.basename(directoryPath)}",\n`
            result += `    collapsible: false,\n`
            result += `    prefix: "/docs/${path.basename(directoryPath)}",\n`
            result += `    children: [\n`
            fileList.forEach((item) => {
                const name = item.text.split(".")[0]
                result += `      {text: "${name}", link: "${name}", },\n`
            })
            result += `    ],\n`
            result += `  },\n`
            result += '] as SidebarArrayOptions;'

            return result
        }
        fileList.forEach((item, index) => {
            if (item.isFile) {
                result += `  "${item.text}",\n`

            } else {
                result += `  {\n`
                result += `    text: "${item.text}",\n`
                result += `    collapsible: false,\n`
                result += `    prefix: "/docs/${path.basename(directoryPath)}/${item.text}",\n`
                result += `    children: [\n`
                item.children.forEach((child) => {
                    const name = child.text.split(".")[0].split("/").pop()
                    result += `      {text: "${name}", link: "${name}", },\n`
                })
                result += `    ],\n`
                result += `  },\n`
            }

            if (index === fileList.length - 1) {
                result += '] as SidebarArrayOptions;'
            }
        })

        return result
    } else {
        console.log('指定的路径不是有效目录！')
    }

}

function writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

function generateSideBarAndWrite(directoryPath) {
    if (fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory()) {
        const readmeFilePath = path.join('./', 'testSideBar.js');

        const result = generateSideBar(directoryPath, '');
        writeToFile(readmeFilePath, result);
        console.log(`文件列表已生成并写入到 ${readmeFilePath}`);
    } else {
        console.log('指定的路径不是有效目录！');
    }
}

const directoryPath = 'D:\\VSCodeProjects\\codefather2.0\\src\\docs\\Java' // 替换为你的目录路径
generateSideBarAndWrite(directoryPath)
