const fs = require('fs');
const path = require('path');

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`已删除文件: ${filePath}`);
    } else {
        console.log(`文件不存在: ${filePath}`);
    }
}

function generateReadme(directory, indent, n) {
    let flag = false;
    let fileList = '';

    const files = fs.readdirSync(directory);
    files.forEach((file, index) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            fileList += `${indent}` + '#'.repeat(n + 1) + ` ${file}\n\n`
            fileList += generateReadme(filePath, `${indent}  `, n + 1);
        } else if (stats.isFile()) {
            if (index === 0 && n === 1) {
                flag = true;
                fileList += `${indent}# ${path.basename(directory)}\n\n`;
            }
            const fileName = file.replace(/ /g, '%20');
            if (fileName.includes('README') || fileName.charAt(0) === '.') {
                return     // 不需要Readme 和 .开头的文件, 跳过
            }
            if (!flag) {
                fileList += `${indent}[${file}](${path.basename(directory)}/${fileName})\n\n`;
            } else {
                fileList += `${indent}[${file}](${fileName})\n\n`;
            }
        }
    });

    return fileList;
}

function writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

function generateReadmeAndWrite(directoryPath) {
    if (fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory()) {
        const readmeFilePath = path.join(directoryPath, 'README.md');

        deleteFile(readmeFilePath);
        const result = generateReadme(directoryPath, '', 1);
        writeToFile(readmeFilePath, result);
        console.log(`文件列表已生成并写入到 ${readmeFilePath}`);
    } else {
        console.log('指定的路径不是有效目录！');
    }
}


function generateBatch() {
    if (fs.existsSync('./')) {
        const fileInfo = fs.lstatSync('./')
            // , '计算', '经验', '前端', '数据', 'Go', 'js', 'Python', '新媒体', '运维'
        const ex = ['.', 'node_modules','js脚本']
        if (fileInfo.isDirectory()) {
            const files = fs.readdirSync('./')

            files.forEach(file => {
                let flag = false
                ex.some(e => {

                    if (file.includes(e)) {
                        flag = true
                        return true
                    }
                    flag = false

                })
                if (!flag) {
                    const filePath = path.join('./', file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        generateReadmeAndWrite(filePath);
                    }
                }


            })
        }

    }
}
generateBatch()
// const directoryPath = 'D:\\VSCodeProjects\\codefather\\Java\\JavaSE'; // 替换为你的目录路径
// generateReadmeAndWrite(directoryPath);
