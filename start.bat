@echo off
echo ========================================
echo      会议报名DApp 一键启动脚本
echo ========================================
echo.

echo 正在检查环境...

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

:: 检查Truffle
truffle version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Truffle，正在安装...
    npm install -g truffle
    if %errorlevel% neq 0 (
        echo ❌ Truffle安装失败
        pause
        exit /b 1
    )
)
echo ✅ Truffle 已就绪

:: 安装依赖
if not exist node_modules (
    echo 📦 正在安装项目依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)
echo ✅ 项目依赖已安装

echo.
echo ========================================
echo            启动选项
echo ========================================
echo 1. 编译合约
echo 2. 运行测试
echo 3. 部署合约 (需要先启动Ganache)
echo 4. 运行合约交互演示
echo 5. 启动前端服务器
echo 6. 全部执行 (编译+测试+部署+演示)
echo 0. 退出
echo ========================================

set /p choice=请选择操作 (0-6): 

if "%choice%"=="1" goto compile
if "%choice%"=="2" goto test
if "%choice%"=="3" goto deploy
if "%choice%"=="4" goto interact
if "%choice%"=="5" goto frontend
if "%choice%"=="6" goto all
if "%choice%"=="0" goto exit
goto invalid

:compile
echo.
echo 🔨 编译智能合约...
truffle compile
if %errorlevel% neq 0 (
    echo ❌ 编译失败
    pause
    exit /b 1
)
echo ✅ 合约编译成功
goto end

:test
echo.
echo 🧪 运行合约测试...
truffle test
if %errorlevel% neq 0 (
    echo ❌ 测试失败
    pause
    exit /b 1
)
echo ✅ 所有测试通过
goto end

:deploy
echo.
echo 📡 部署合约到本地网络...
echo ⚠️  请确保Ganache已启动 (127.0.0.1:8545)
pause
truffle migrate --reset
if %errorlevel% neq 0 (
    echo ❌ 部署失败，请检查Ganache是否运行
    pause
    exit /b 1
)
echo ✅ 合约部署成功
echo.
echo 📝 请将合约地址复制到 src/app.js 文件中的 contractAddress 变量
goto end

:interact
echo.
echo 🎮 运行合约交互演示...
truffle exec scripts/interact.js
goto end

:frontend
echo.
echo 🌐 启动前端服务器...
echo 📍 前端地址: http://localhost:8080
echo 📁 文件位置: src/index.html
echo.
cd src
start http://localhost:8080
python -m http.server 8080 2>nul || (
    echo Python未找到，尝试使用Node.js http-server...
    npx http-server -p 8080 -o
)
goto end

:all
echo.
echo 🚀 执行完整流程...
echo.
echo 步骤1: 编译合约
truffle compile
if %errorlevel% neq 0 goto error

echo.
echo 步骤2: 运行测试
truffle test
if %errorlevel% neq 0 goto error

echo.
echo 步骤3: 部署合约
echo ⚠️  请确保Ganache已启动
pause
truffle migrate --reset
if %errorlevel% neq 0 goto error

echo.
echo 步骤4: 运行演示
truffle exec scripts/interact.js

echo.
echo 🎉 所有步骤完成！
echo 📝 记得将合约地址更新到前端配置中
goto end

:error
echo ❌ 执行过程中出现错误
pause
exit /b 1

:invalid
echo ❌ 无效选择，请重新运行脚本
pause
exit /b 1

:end
echo.
echo ========================================
echo              操作完成
echo ========================================
echo.
echo 📚 查看完整指导: 实验指导手册.md
echo 🔧 如有问题，请检查环境配置
echo.
pause

:exit
echo 👋 感谢使用！
exit /b 0
