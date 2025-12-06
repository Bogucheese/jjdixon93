package com.example;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// 注意：如果你用的是老版本 Tomcat (8或以下)，上面的 jakarta 要换成 javax
// @WebServlet("/login") 告诉服务器：如果有人访问 /login，就找我！
@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 1. 设置编码，防止中文乱码
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        // 2. 获取前端发来的数据 (根据 input 的 name 属性)
        String username = request.getParameter("username"); // 获取 name="username" 的值
        String password = request.getParameter("password"); // 获取 name="password" 的值

        // 3. 模拟验证逻辑 (这里我们写死，假设账号是 admin，密码是 123)
        // 实际开发中，这里会去连接数据库查询
        if ("admin".equals(username) && "123".equals(password)) {
            // --- 登录成功 ---
            System.out.println("后台日志：用户 " + username + " 登录成功！");

            // 方式 A: 直接跳转到成功页面 (推荐)
            response.sendRedirect("success.html");

        } else {
            // --- 登录失败 ---
            System.out.println("后台日志：用户 " + username + " 登录失败！");

            // 方式 B: 在页面上打印错误提示，并包含一段脚本 2秒后返回
            PrintWriter out = response.getWriter();
            out.println("<html>");
            out.println("<head><title>登录失败</title></head>");
            out.println("<body style='background:#0f0c29; color:white; text-align:center; padding-top:100px; font-family:sans-serif;'>");
            out.println("<h1>❌ 账号或密码错误</h1>");
            out.println("<p>正在返回登录页...</p>");
            out.println("<script>setTimeout(function(){ window.location.href='login.html'; }, 2000);</script>");
            out.println("</body>");
            out.println("</html>");
        }
    }

    // 为了防止有人直接在浏览器地址栏按回车访问 /login (那是 GET 请求)，我们也处理一下
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.sendRedirect("login.html"); // 让他滚回登录页去
    }
}